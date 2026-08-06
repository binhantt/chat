import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JoinMatchCommand } from '../join-match.command';
import { MatchQueue, MatchQueueStatus } from '../../entities/match-queue.entity';
import { User, UserGender } from '../../../users/entities/user.entity';
import { MatchQueueRepository } from '../../repositories/match-queue.repository';
import { MatchService } from '../../match.service';
import { SpeedBoostService } from '../../services/speed-boost.service';
import { AiChatService } from '../../../ai/ai-chat.service';
import { EventBusService } from '../../events/event-bus.service';
import { createMatchJoinedEvent } from '../../events/match-joined.event';

@Injectable()
export class JoinMatchHandler {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly matchQueueRepository: MatchQueueRepository,
    private readonly matchService: MatchService,
    private readonly speedBoostService: SpeedBoostService,
    private readonly aiChatService: AiChatService,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: JoinMatchCommand): Promise<MatchQueue> {
    const { userId, preferredGender, city: filterCity, ageMin, ageMax } = command;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (!user.isGuest && (!user.gender || !user.city)) {
      throw new BadRequestException(
        'Vui lòng cập nhật thông tin giới tính và thành phố của bạn',
      );
    }

    await this.matchService.cancelActiveMatchForNewSearch(userId);

    // If user exited 5 times → force AI conversation immediately
    if (this.matchService.shouldForceAiConversation(userId)) {
      const aiSettings = await this.aiChatService.getSettings();
      const hasKeys = aiSettings?.enabled && (
        (aiSettings.groqApiKeys && aiSettings.groqApiKeys.length > 0) || aiSettings.groqApiKey
      );
      if (hasKeys) {
        this.matchService.resetExitCount(userId);
        await this.matchService.createAiConversation(userId, 'forced');
        // Return a dummy queue so the client knows something happened
        return this.matchQueueRepository.create({
          userId,
          status: MatchQueueStatus.Matched,
        } as Partial<MatchQueue>) as MatchQueue;
      }
    }

    // Priority score is now based on speed-boost status (80 if boosted, 0 otherwise)
    const priorityScore = await this.speedBoostService.getPriorityScore(userId);

    const effectiveCity = filterCity || user.city;
    const queueGender: UserGender = preferredGender
      ? (preferredGender as UserGender)
      : user.gender!;

    let effectiveAgeMin = ageMin;
    let effectiveAgeMax = ageMax;
    if (!ageMin && !ageMax && user.dateOfBirth) {
      effectiveAgeMin = 18;
      effectiveAgeMax = 60;
    }

    const queueExpiryMinutes = await this.matchService.getQueueExpiryMinutes();
    const queue = this.matchQueueRepository.create({
      userId,
      gender: queueGender,
      city: effectiveCity,
      preferredGender,
      ageMin: effectiveAgeMin,
      ageMax: effectiveAgeMax,
      priorityScore,
      status: MatchQueueStatus.Waiting,
      expiresAt: new Date(Date.now() + queueExpiryMinutes * 60 * 1000),
    });

    await this.matchQueueRepository.saveOne(queue);
    this.eventBus.emit(createMatchJoinedEvent(userId, queue.id, queueGender, effectiveCity));

    const match = await this.matchService.findMatch(queue);
    if (match) {
      const matchedQueue = await this.matchService.createMatch(queue, match);
      if (matchedQueue) {
        return matchedQueue;
      }
    }

    return queue;
  }
}
