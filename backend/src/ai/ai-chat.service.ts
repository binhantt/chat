import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiSettings } from './entities/ai-settings.entity';
import { User } from '../users/entities/user.entity';

const DEFAULT_SYSTEM_PROMPT = `Bạn là Minh Anh, một cô gái 22 tuổi thân thiện và dễ gần.
Bạn đang trò chuyện trên ứng dụng "Người Lạ" - một nền tảng chat trực tuyến.
Phong cách nói chuyện:
- Thân thiện, tự nhiên, như đang nhắn tin với bạn bè
- Trả lời ngắn gọn, 1-3 câu
- Thỉnh thoảng dùng từ lóng, icon đơn giản
- Hỏi lại对方 để giữ cuộc trò chuyện
- Không透露个人信息 ngoài những gì đã設定
- Nói tiếng Việt tự nhiên`;

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private messageCounts = new Map<string, number>();
  private currentKeyIndex = 0;
  private keyCooldowns = new Map<string, number>();

  constructor(
    @InjectRepository(AiSettings)
    private readonly settingsRepo: Repository<AiSettings>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getSettings(): Promise<AiSettings | null> {
    return this.settingsRepo.findOne({ where: {} });
  }

  async getSettingsWithKey(): Promise<AiSettings | null> {
    const settings = await this.settingsRepo
      .createQueryBuilder('s')
      .addSelect('s.groqApiKey')
      .addSelect('s.groqApiKeys')
      .getOne();
    return settings;
  }

  async updateSettings(partial: Partial<AiSettings>): Promise<AiSettings> {
    let settings = await this.settingsRepo.findOne({ where: {} });
    if (!settings) {
      settings = this.settingsRepo.create(partial);
    } else {
      Object.assign(settings, partial);
    }
    return this.settingsRepo.save(settings);
  }

  async findOrCreateBotUser(): Promise<User> {
    let bot = await this.userRepo.findOne({ where: { email: 'bot@nguoila.online' } });
    if (!bot) {
      bot = this.userRepo.create({
        email: 'bot@nguoila.online',
        fullName: 'Minh Anh',
        gender: 'female' as any,
        isGuest: false,
        isActive: true,
      });
      bot = await this.userRepo.save(bot);
      this.logger.log('Bot user created');
    }
    return bot;
  }

  async shouldReply(conversationId: string): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings || !settings.enabled) return false;
    if (!this.pickKey(settings)) return false;

    const count = (this.messageCounts.get(conversationId) || 0) + 1;
    this.messageCounts.set(conversationId, count);

    return count % settings.replyFrequency === 0;
  }

  /** Collect all valid keys: groqApiKeys array first, then single groqApiKey as fallback */
  private collectKeys(settings: AiSettings): string[] {
    const keys: string[] = [];
    if (settings.groqApiKeys?.length) {
      for (const k of settings.groqApiKeys) {
        if (k?.trim() && !keys.includes(k)) keys.push(k);
      }
    }
    if (settings.groqApiKey?.trim() && !keys.includes(settings.groqApiKey)) {
      keys.push(settings.groqApiKey);
    }
    return keys;
  }

  /** Pick the next available key (not on cooldown). Returns null if all keys exhausted. */
  private pickKey(settings: AiSettings): string | null {
    const keys = this.collectKeys(settings);
    if (keys.length === 0) return null;

    const now = Date.now();
    for (let i = 0; i < keys.length; i++) {
      const idx = (this.currentKeyIndex + i) % keys.length;
      const cooldown = this.keyCooldowns.get(keys[idx]) ?? 0;
      if (cooldown <= now) {
        this.currentKeyIndex = idx;
        return keys[idx];
      }
    }
    return null;
  }

  private markKeyCooldown(key: string): void {
    this.keyCooldowns.set(key, Date.now() + 60_000);
    this.logger.warn(`Key ...${key.slice(-6)} on cooldown 60s`);
    this.currentKeyIndex++;
  }

  async generateReply(
    userMessage: string,
    conversationHistory: { role: string; content: string }[],
  ): Promise<string | null> {
    const settings = await this.getSettingsWithKey();
    if (!settings) return null;

    const allKeys = this.collectKeys(settings);
    if (allKeys.length === 0) return null;

    const messages = [
      { role: 'system', content: settings.systemPrompt || DEFAULT_SYSTEM_PROMPT },
      ...conversationHistory.slice(-10),
      { role: 'user', content: userMessage },
    ];

    for (let attempt = 0; attempt < allKeys.length; attempt++) {
      const apiKey = this.pickKey(settings);
      if (!apiKey || !apiKey.trim()) {
        this.logger.warn('All API keys on cooldown or empty');
        return null;
      }

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: settings.model || 'llama-3.3-70b-versatile',
            messages,
            max_tokens: 256,
            temperature: 0.8,
          }),
        });

        if (response.status === 429 || response.status === 402 || response.status === 401) {
          this.markKeyCooldown(apiKey);
          continue;
        }

        if (!response.ok) {
          this.logger.error(`Groq API error key ...${apiKey.slice(-6)}: ${response.status}`);
          this.markKeyCooldown(apiKey);
          continue;
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
      } catch (error) {
        this.logger.error(`Request failed key ...${apiKey.slice(-6)}`, error);
        this.markKeyCooldown(apiKey);
      }
    }
    return null;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const settings = await this.getSettingsWithKey();
    const keys = this.collectKeys(settings!);
    if (keys.length === 0) {
      return { success: false, message: 'Chưa cấu hình API key' };
    }

    let lastError = '';
    for (const apiKey of keys) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (response.ok) {
          return { success: true, message: `Kết nối OK (key ...${apiKey.slice(-6)})` };
        }
        lastError = `Lỗi ${response.status}`;
      } catch {
        lastError = 'Không thể kết nối Groq API';
      }
    }
    return { success: false, message: lastError || 'Tất cả key đều không hoạt động' };
  }

  clearConversationCount(conversationId: string) {
    this.messageCounts.delete(conversationId);
  }

  getMessageCount(conversationId: string): number {
    return this.messageCounts.get(conversationId) || 0;
  }
}
