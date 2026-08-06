"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text, TextField, Switch, Button, Callout, Spinner } from "@radix-ui/themes";
import { getCsrfHeaders } from "@/lib/csrf";

const cardStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  padding: 20,
};

type AiSettings = {
  id?: string;
  enabled: boolean;
  groqApiKey: string;
  groqApiKeys: string[];
  model: string;
  systemPrompt: string;
  replyFrequency: number;
  botName: string;
  personality: string;
  botGender: string;
  timeoutMinutes: number;
  aiTakeoverMessages: number;
};

const DEFAULT_SETTINGS: AiSettings = {
  enabled: false,
  groqApiKey: "",
  groqApiKeys: [],
  model: "llama-3.3-70b-versatile",
  systemPrompt: "",
  replyFrequency: 4,
  botName: "Minh Anh",
  personality: "",
  botGender: "female",
  timeoutMinutes: 5,
  aiTakeoverMessages: 4,
};

const PAID_MODELS: Record<string, { label: string; provider: string; pricing: string }> = {
  "llama-3.3-70b-versatile": { label: "Llama 3.3 70B", provider: "Groq", pricing: "Free tier có giới hạn" },
  "llama-3.1-8b-instant": { label: "Llama 3.1 8B", provider: "Groq", pricing: "Free tier có giới hạn" },
  "gemma2-9b-it": { label: "Gemma 2 9B", provider: "Groq", pricing: "Free tier có giới hạn" },
  "mixtral-8x7b-32768": { label: "Mixtral 8x7B", provider: "Groq", pricing: "Free tier có giới hạn" },
  "gpt-4o": { label: "GPT-4o", provider: "OpenAI", pricing: "Trả phí ~$2.5/1M tokens input" },
  "gpt-4o-mini": { label: "GPT-4o Mini", provider: "OpenAI", pricing: "Trả phí ~$0.15/1M tokens input" },
  "claude-sonnet-4-20250514": { label: "Claude Sonnet 4", provider: "Anthropic", pricing: "Trả phí ~$3/1M tokens input" },
  "claude-3-5-haiku-20241022": { label: "Claude 3.5 Haiku", provider: "Anthropic", pricing: "Trả phí ~$0.25/1M tokens input" },
};

export function AiClientView() {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/v1/manager/ai/settings", { credentials: "include" })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) {
          const err = await r.json().catch(() => null);
          setMessage({ type: "error", text: err?.message || "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
          return;
        }
        if (!r.ok) return;
        const data = await r.json();
        setSettings((prev) => ({
          ...prev,
          ...data,
          groqApiKey: data.groqApiKey || "",
          groqApiKeys: data.groqApiKeys || [],
        }));
      })
      .catch(() => setMessage({ type: "error", text: "Không thể kết nối server" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        enabled: settings.enabled,
        groqApiKey: settings.groqApiKey,
        groqApiKeys: settings.groqApiKeys.filter((k) => k.trim()),
        model: settings.model,
        systemPrompt: settings.systemPrompt,
        replyFrequency: settings.replyFrequency,
        botName: settings.botName,
        personality: settings.personality,
        botGender: settings.botGender,
        timeoutMinutes: settings.timeoutMinutes,
        aiTakeoverMessages: settings.aiTakeoverMessages,
      };
      const res = await fetch("/api/v1/manager/ai/settings", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Đã lưu cài đặt AI" });
      } else {
        const err = await res.json().catch(() => null);
        setMessage({ type: "error", text: err?.message || "Lỗi khi lưu" });
      }
    } catch {
      setMessage({ type: "error", text: "Không thể kết nối server" });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/manager/ai/test", {
        method: "POST",
        credentials: "include",
        headers: getCsrfHeaders(),
      });
      const data = await res.json();
      setMessage({
        type: data.success ? "success" : "error",
        text: data.message,
      });
    } catch {
      setMessage({ type: "error", text: "Không thể test kết nối" });
    } finally {
      setTesting(false);
    }
  };

  const addKey = () => {
    if (settings.groqApiKeys.length >= 5) return;
    setSettings((prev) => ({ ...prev, groqApiKeys: [...prev.groqApiKeys, ""] }));
  };

  const updateKey = (index: number, value: string) => {
    const updated = [...settings.groqApiKeys];
    updated[index] = value;
    setSettings((prev) => ({ ...prev, groqApiKeys: updated }));
  };

  const removeKey = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      groqApiKeys: prev.groqApiKeys.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 400 }}>
        <Spinner size="3" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="4" style={{ maxWidth: 700 }}>
      {/* Header */}
      <Box style={cardStyle}>
        <Flex align="center" justify="between">
          <Flex direction="column" gap="1">
            <Text size="4" weight="bold" style={{ color: "var(--color-text)" }}>
              AI Chat Bot
            </Text>
            <Text size="2" style={{ color: "var(--color-muted)" }}>
              Bot AI tự động trò chuyện khi không tìm được người thật
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <Text size="2" style={{ color: settings.enabled ? "#22c55e" : "var(--color-muted)" }}>
              {settings.enabled ? "Đang bật" : "Đang tắt"}
            </Text>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(v) => setSettings((prev) => ({ ...prev, enabled: v }))}
              color="green"
            />
          </Flex>
        </Flex>
      </Box>

      {/* API Keys */}
      <Box style={cardStyle}>
        <Flex direction="column" gap="3">
          <Flex align="center" justify="between">
            <Text size="3" weight="bold" style={{ color: "var(--color-text)" }}>
              API Keys (tối đa 5)
            </Text>
            <Text size="1" style={{ color: "var(--color-muted)" }}>
              Tự chuyển key khi hết quota
            </Text>
          </Flex>
          <Text size="1" style={{ color: "var(--color-muted)" }}>
            Lấy key tại{" "}
            <a href="https://console.groq.com/home" target="_blank" rel="noreferrer" style={{ color: "var(--color-accent)" }}>
              console.groq.com
            </a>
          </Text>

          {settings.groqApiKeys.map((key, i) => (
            <Flex key={i} gap="2" align="center">
              <Text size="1" style={{ color: "var(--color-muted)", minWidth: 24 }}>#{i + 1}</Text>
              <TextField.Root
                type={showKeys[i] ? "text" : "password"}
                placeholder="gsk_..."
                value={key}
                onChange={(e) => updateKey(i, e.target.value)}
                style={{ flex: 1 }}
              />
              <Button variant="soft" size="1" onClick={() => setShowKeys((p) => ({ ...p, [i]: !p[i] }))}>
                {showKeys[i] ? "Ẩn" : "Hiện"}
              </Button>
              <Button variant="soft" color="red" size="1" onClick={() => removeKey(i)}>
                Xoá
              </Button>
            </Flex>
          ))}

          {settings.groqApiKeys.length < 5 && (
            <Button variant="soft" size="2" onClick={addKey}>
              + Thêm key ({settings.groqApiKeys.length}/5)
            </Button>
          )}

          {/* Legacy single key */}
          {settings.groqApiKeys.length === 0 && (
            <Flex gap="2" align="center">
              <Text size="1" style={{ color: "var(--color-muted)", minWidth: 24 }}>#1</Text>
              <TextField.Root
                type="password"
                placeholder="gsk_..."
                value={settings.groqApiKey}
                onChange={(e) => setSettings((prev) => ({ ...prev, groqApiKey: e.target.value }))}
                style={{ flex: 1 }}
              />
            </Flex>
          )}

          <Flex gap="2">
            <Button
              variant="soft"
              color="blue"
              size="2"
              disabled={testing}
              onClick={handleTest}
            >
              {testing ? <Spinner size="1" /> : "Test kết nối"}
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Model & Config */}
      <Box style={cardStyle}>
        <Flex direction="column" gap="3">
          <Text size="3" weight="bold" style={{ color: "var(--color-text)" }}>
            Cấu hình
          </Text>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium" style={{ color: "var(--color-text)" }}>Model</Text>
            <TextField.Root
              value={settings.model}
              onChange={(e) => setSettings((prev) => ({ ...prev, model: e.target.value }))}
              placeholder="llama-3.3-70b-versatile"
            />
            {(() => {
              const modelInfo = PAID_MODELS[settings.model];
              if (!modelInfo) return (
                <Text size="1" style={{ color: "var(--color-muted)" }}>
                  Nhập tên model tùy chỉnh
                </Text>
              );
              const isFree = modelInfo.pricing.toLowerCase().includes("free");
              return (
                <Flex align="center" gap="2" wrap="wrap">
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: isFree ? "#dcfce7" : "#fef3c7",
                    color: isFree ? "#16a34a" : "#d97706",
                    border: `1px solid ${isFree ? "#bbf7d0" : "#fde68a"}`,
                  }}>
                    {isFree ? "Free" : "Paid"}
                  </span>
                  <Text size="1" style={{ color: "var(--color-muted)" }}>
                    {modelInfo.label} ({modelInfo.provider}) — {modelInfo.pricing}
                  </Text>
                </Flex>
              );
            })()}
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium" style={{ color: "var(--color-text)" }}>Tên bot</Text>
            <TextField.Root
              value={settings.botName}
              onChange={(e) => setSettings((prev) => ({ ...prev, botName: e.target.value }))}
              placeholder="Minh Anh"
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium" style={{ color: "var(--color-text)" }}>Giới tính bot</Text>
            <TextField.Root
              value={settings.botGender}
              onChange={(e) => setSettings((prev) => ({ ...prev, botGender: e.target.value }))}
              placeholder="female"
            />
          </Flex>
        </Flex>
      </Box>

      {/* AI Behavior */}
      <Box style={cardStyle}>
        <Flex direction="column" gap="3">
          <Text size="3" weight="bold" style={{ color: "var(--color-text)" }}>
            Hành vi AI
          </Text>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium" style={{ color: "var(--color-text)" }}>
              Timeout (phút)
            </Text>
            <TextField.Root
              type="number"
              min={1}
              max={30}
              value={settings.timeoutMinutes}
              onChange={(e) => setSettings((prev) => ({ ...prev, timeoutMinutes: parseInt(e.target.value) || 5 }))}
            />
            <Text size="1" style={{ color: "var(--color-muted)" }}>
              Sau {settings.timeoutMinutes} phút không tìm được người thật, bot AI sẽ tự động trả lời
            </Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium" style={{ color: "var(--color-text)" }}>
              AI takeover sau (tin nhắn)
            </Text>
            <TextField.Root
              type="number"
              min={1}
              max={20}
              value={settings.aiTakeoverMessages}
              onChange={(e) => setSettings((prev) => ({ ...prev, aiTakeoverMessages: parseInt(e.target.value) || 4 }))}
            />
            <Text size="1" style={{ color: "var(--color-muted)" }}>
              Sau {settings.aiTakeoverMessages} tin nhắn không tìm được người, AI sẽ nhận conversation
            </Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium" style={{ color: "var(--color-text)" }}>
              Tần suất reply (1/{settings.replyFrequency} tin nhắn)
            </Text>
            <TextField.Root
              type="number"
              min={1}
              max={50}
              value={settings.replyFrequency}
              onChange={(e) => setSettings((prev) => ({ ...prev, replyFrequency: parseInt(e.target.value) || 4 }))}
            />
            <Text size="1" style={{ color: "var(--color-muted)" }}>
              Bot sẽ trả lời 1 tin sau mỗi {settings.replyFrequency} tin nhắn của user
            </Text>
          </Flex>
        </Flex>
      </Box>

      {/* System Prompt */}
      <Box style={cardStyle}>
        <Flex direction="column" gap="3">
          <Text size="3" weight="bold" style={{ color: "var(--color-text)" }}>
            System Prompt / Personality
          </Text>
          <Text size="1" style={{ color: "var(--color-muted)" }}>
            Để trống sẽ dùng prompt mặc định (nữ, thân thiện, trả lời ngắn)
          </Text>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => setSettings((prev) => ({ ...prev, systemPrompt: e.target.value }))}
            placeholder="Bạn là Minh Anh, một cô gái 22 tuổi thân thiện..."
            rows={6}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
              fontSize: 14,
              resize: "vertical",
              fontFamily: "var(--font-body)",
            }}
          />
        </Flex>
      </Box>

      {/* Message */}
      {message && (
        <Callout.Root color={message.type === "success" ? "green" : "red"}>
          <Callout.Text>{message.text}</Callout.Text>
        </Callout.Root>
      )}

      {/* Save */}
      <Button
        size="3"
        disabled={saving}
        onClick={handleSave}
        style={{ background: "var(--color-accent)", color: "#fff", fontWeight: 600 }}
      >
        {saving ? <Spinner size="1" /> : "Lưu cài đặt"}
      </Button>
    </Flex>
  );
}
