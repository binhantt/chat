"use client";

import { Flex, Text, Box, Avatar } from "@radix-ui/themes";
import { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getConversations } from "@/features/athu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface BackendUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  city?: string | null;
}

interface BackendConversation {
  id: string;
  user1Id: string;
  user2Id: string;
  user1?: BackendUser;
  user2?: BackendUser;
  status: "active" | "ended" | "blocked";
  user1Accepted?: boolean;
  user2Accepted?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatPartner {
  conversationId: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  partnerAvatar: string | null;
  partnerCity: string | null;
  chatReady: boolean;
  lastTime: string;
  status: "active" | "ended" | "blocked";
  lastMessage?: string;
}

interface SearchPeopleProps {
  onSelectConversation?: (conversationId: string, partner: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    gender: string | null;
    city: string | null;
  }) => void;
}

export const SearchPeople = memo(function SearchPeople({ onSelectConversation }: SearchPeopleProps) {
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<ChatPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebouncedValue(query);
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const inputRef = useRef<HTMLInputElement>(null);

  // Theme colors
  const bgPrimary = isDark ? "#1a1a2e" : "#f8fafc";
  const bgSecondary = isDark ? "#16213e" : "#ffffff";
  const bgHover = isDark ? "rgba(255,255,255,0.08)" : "rgba(99, 102, 241, 0.06)";
  const textPrimary = isDark ? "#e2e8f0" : "#1e293b";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConversations();
      if (Array.isArray(data)) {
        const formatted: ChatPartner[] = data.map((conv: BackendConversation) => {
          const isUser1 = conv.user1Id === user?.id;
          const partner = isUser1 ? conv.user2 : conv.user1;
          const partnerId = isUser1 ? conv.user2Id : conv.user1Id;
          const chatReady = conv.user1Accepted === true && conv.user2Accepted === true;

          return {
            conversationId: conv.id,
            partnerId,
            partnerName: "Nguoi an danh",
            partnerEmail: "",
            partnerAvatar: null,
            partnerCity: partner?.city || null,
            chatReady,
            lastTime: formatTimeAgo(conv.updatedAt),
            status: conv.status as "active" | "ended" | "blocked",
          };
        });
        setConversations(formatted);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  useEffect(() => {
    if (!user) return;

    const source = new EventSource("/api/chat/stream", {
      withCredentials: true,
    });

    source.addEventListener("chat", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data);
        if (
          payload?.type === "conversation.created" ||
          payload?.type === "conversation.ended" ||
          payload?.type === "conversation.accepted" ||
          payload?.type === "message.created"
        ) {
          void fetchConversations();
        }
      } catch (error) {
        console.error("Invalid chat stream event:", error);
      }
    });

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, [fetchConversations, user]);

  const filtered = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    if (!normalizedQuery) return conversations;

    return conversations.filter((c) =>
      c.partnerName.toLowerCase().includes(normalizedQuery) ||
      c.partnerEmail.toLowerCase().includes(normalizedQuery)
    );
  }, [conversations, debouncedQuery]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins}p`;
    if (diffHours < 24) return `${diffHours}gi`;
    if (diffDays < 7) return `${diffDays}ng`;
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const getUserInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSelectConversation = (chat: ChatPartner) => {
    onSelectConversation?.(chat.conversationId, {
      id: chat.partnerId,
      email: chat.partnerEmail,
      fullName: chat.partnerName,
      avatarUrl: chat.partnerAvatar,
      gender: null,
      city: chat.partnerCity,
    });
  };

  return (
    <Flex
      direction="column"
      align="center"
      gap="5"
      style={{ width: "100%", maxWidth: 500 }}
    >
      {/* Icon */}
      <Box
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 12px 40px rgba(99, 102, 241, 0.35)`,
        }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </Box>

      {/* Title */}
      <Flex direction="column" align="center" gap="2">
        <Text size="5" weight="bold" style={{ color: textPrimary }}>
          Tìm kiếm cuộc trò chuyện
        </Text>
        <Text size="2" style={{ color: textSecondary, textAlign: "center" }}>
          Tìm theo tên người dùng hoặc email
        </Text>
      </Flex>

      {/* Search Input */}
      <Box
        style={{
          width: "100%",
          position: "relative",
        }}
      >
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            background: bgSecondary,
            border: `2px solid ${borderColor}`,
            borderRadius: 16,
            padding: "4px 8px 4px 16px",
            transition: "all 0.2s",
            boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textSecondary} strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Nhập tên hoặc email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              padding: "14px 12px",
              fontSize: "15px",
              color: textPrimary,
              outline: "none",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textSecondary} strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </Box>
      </Box>

      {/* Results */}
      <Box
        style={{
          width: "100%",
          maxHeight: 400,
          overflowY: "auto",
          background: bgSecondary,
          borderRadius: 20,
          border: `1px solid ${borderColor}`,
          boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.2)" : "0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        {loading ? (
          <Flex direction="column" align="center" justify="center" gap="4" py="8">
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `3px solid ${borderColor}`,
                borderTopColor: accentColor,
                animation: "spin 0.8s linear infinite",
              }}
            />
            <Text size="2" style={{ color: textSecondary }}>Đang tải...</Text>
          </Flex>
        ) : filtered.length === 0 ? (
          <Flex direction="column" align="center" justify="center" gap="3" py="8" px="4">
            <Box
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={textSecondary} strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </Box>
            <Text size="2" weight="medium" style={{ color: textSecondary }}>
              {query ? "Không tìm thấy kết quả" : "Chưa có cuộc trò chuyện nào"}
            </Text>
            {query && (
              <Text size="1" style={{ color: textSecondary, opacity: 0.7 }}>
                Thử tìm với từ khóa khác
              </Text>
            )}
          </Flex>
        ) : (
          <Box>
            {filtered.map((chat, index) => (
              <Box
                key={chat.conversationId}
                onClick={() => handleSelectConversation(chat)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "16px",
                  cursor: "pointer",
                  borderBottom: index < filtered.length - 1 ? `1px solid ${borderColor}` : "none",
                  transition: "background 0.15s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = bgHover;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Avatar */}
                <Box position="relative">
                  <Avatar
                    size="3"
                    radius="full"
                    src={chat.partnerAvatar || undefined}
                    fallback={getUserInitials(chat.partnerName)}
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  />
                  <Box
                    position="absolute"
                    style={{
                      bottom: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: chat.status === "active" ? "#22c55e" : "#94a3b8",
                      border: "2px solid",
                      borderColor: bgSecondary,
                    }}
                  />
                </Box>

                {/* Info */}
                <Flex direction="column" gap="0" style={{ flex: 1, minWidth: 0 }}>
                  <Flex align="center" gap="2">
                    <Text size="2" weight="medium" style={{ color: textPrimary }}>
                      {chat.partnerName}
                    </Text>
                    <Box
                      style={{
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: chat.status === "active"
                          ? "rgba(34, 197, 94, 0.15)"
                          : "rgba(148, 163, 184, 0.15)",
                      }}
                    >
                      <Text size="1" style={{ color: chat.status === "active" ? "#22c55e" : "#94a3b8" }}>
                        {!chat.chatReady
                          ? "Cho xac nhan"
                          : chat.status === "active"
                            ? "Hoạt động"
                            : "Đã kết thúc"}
                      </Text>
                    </Box>
                  </Flex>
                  <Text
                    size="1"
                    style={{
                      color: textSecondary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {chat.partnerCity || "Chua co dia diem"}
                  </Text>
                </Flex>

                {/* Time */}
                <Text size="1" style={{ color: textSecondary, flexShrink: 0 }}>
                  {chat.lastTime}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Flex>
  );
});
