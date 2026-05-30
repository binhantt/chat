"use client";

import {
  Flex,
  Text,
  TextField,
  Box,
  Avatar,
  ScrollArea,
  Dialog,
  Badge,
} from "@radix-ui/themes";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ReportUserDialog } from "@/features/report/components/ReportUserDialog";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: string;
  createdAt: string;
}

interface MatchedUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  gender: string | null;
  city: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
}

interface ConversationUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  gender?: string | null;
  city?: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
}

interface ConversationDetail {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Accepted?: boolean;
  user2Accepted?: boolean;
  user1?: ConversationUser;
  user2?: ConversationUser;
}

interface ChatAreaProps {
  selectedUser: string;
  matchedUser?: MatchedUser | null;
  conversationId?: string | null;
  onBack?: () => void;
}

export function ChatArea({
  matchedUser,
  conversationId,
  onBack,
}: ChatAreaProps) {
  const { user } = useAuth();
  const userId = user?.id;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [resolvedUser, setResolvedUser] = useState<MatchedUser | null>(
    matchedUser ?? null,
  );
  const [currentUserAccepted, setCurrentUserAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef(0);
  const emojiOptions = [
    "😀",
    "😂",
    "😍",
    "🥰",
    "😎",
    "😭",
    "😡",
    "👍",
    "👏",
    "🙏",
    "❤",
    "🔥",
    "✨",
    "🎉",
    "💬",
    "✅",
  ];

  const otherUser = resolvedUser ?? matchedUser;
  const canViewProfile = currentUserAccepted;
  const visibleUser = canViewProfile
    ? otherUser
    : otherUser
      ? {
          ...otherUser,
          email: "",
          fullName: null,
          avatarUrl: null,
          city: null,
        }
      : null;

  // Theme colors
  const bgPrimary = isDark ? "#1a1a2e" : "#f8fafc";
  const bgSecondary = isDark ? "#16213e" : "#ffffff";
  const bgMessageMe = isDark
    ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
    : "linear-gradient(135deg, #6366f1, #8b5cf6)";
  const bgMessageOther = isDark ? "#0f172a" : "#f1f5f9";
  const textPrimary = isDark ? "#e2e8f0" : "#1e293b";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const textOnPrimary = "#ffffff";
  const accentColor = "#6366f1";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  const getUserInitials = (name: string | null | undefined, email: string) => {
    if (!name) return email ? email.slice(0, 2).toUpperCase() : "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hom nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hom qua";
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const fetchConversationUser = useCallback(async () => {
    if (!conversationId || !userId) {
      setResolvedUser(matchedUser ?? null);
      return;
    }

    try {
      const res = await fetch(`/api/v1/chat/conversations/${conversationId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 403 || res.status === 404) {
          setConversationEnded(true);
        }
        return;
      }

      const conversation = (await res.json()) as ConversationDetail;
      const isUser1 = conversation.user1Id === userId;
      const partner = isUser1 ? conversation.user2 : conversation.user1;
      const partnerId = isUser1 ? conversation.user2Id : conversation.user1Id;
      const nextCurrentUserAccepted = isUser1
        ? conversation.user1Accepted === true
        : conversation.user2Accepted === true;
      const canViewProfile = nextCurrentUserAccepted;

      setCurrentUserAccepted(nextCurrentUserAccepted);
      setResolvedUser({
        id: partner?.id || partnerId,
        email: canViewProfile ? partner?.email || "" : "",
        fullName: canViewProfile ? partner?.fullName || null : null,
        avatarUrl: canViewProfile ? partner?.avatarUrl || null : null,
        gender: canViewProfile ? partner?.gender || null : null,
        city: canViewProfile ? partner?.city || matchedUser?.city || null : null,
        dateOfBirth: canViewProfile ? partner?.dateOfBirth || null : null,
        phoneNumber: canViewProfile ? partner?.phoneNumber || null : null,
        bio: canViewProfile ? partner?.bio || null : null,
      });
    } catch (error) {
      console.error("Error fetching conversation user:", error);
    }
  }, [conversationId, matchedUser, userId]);

  const fetchMessages = useCallback(
    async () => {
      if (!conversationId) {
        onBack?.();
        return;
      }

      for (let attempt = 0; attempt < 4; attempt += 1) {
        setLoadError(null);
        try {
          const res = await fetch(
            `/api/v1/chat/conversations/${conversationId}/messages`,
            {
              credentials: "include",
              signal: AbortSignal.timeout(8000),
            },
          );

          if (res.ok) {
            const data = await res.json();
            setMessages(Array.isArray(data) ? data.reverse() : []);
            setLoading(false);
            setLoadError(null);
            return;
          }

        if (res.status === 403 || res.status === 404) {
          setConversationEnded(true);
          setLoading(false);
          return;
        }
        } catch {
          // Retry below.
        }

        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }

      setLoadError("Không tải được tin nhắn. Kiểm tra kết nối và thử lại.");
      setLoading(false);
    },
    [conversationId, onBack],
  );

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || sending || conversationEnded) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setSending(true);
    setSendError(null);
    try {
      await sendTypingState(false);
      const res = await fetch(
        `/api/v1/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
          body: JSON.stringify({ content: newMessage.trim() }),
        },
      );

      if (res.ok) {
        setNewMessage("");
      } else {
        const error = await res.json();
        if (res.status === 403 || res.status === 404) {
          setConversationEnded(true);
        }
        setSendError(error.message || "Không thể gửi tin nhắn");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSendError("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  const sendTypingState = useCallback(
    async (isTyping: boolean) => {
      if (!conversationId) return;
      if (conversationEnded) return;

      try {
        await fetch(`/api/v1/chat/conversations/${conversationId}/typing`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
          body: JSON.stringify({ isTyping }),
        });
      } catch {
        // Typing is a soft realtime signal, so failed requests should not block chat.
      }
    },
    [conversationEnded, conversationId],
  );

  const leaveCurrentMatch = useCallback(async () => {
    await fetch("/api/v1/match/leave", {
      method: "DELETE",
      credentials: "include",
      headers: getCsrfHeaders(),
    }).catch(() => undefined);
  }, []);

  const handleAcceptConversation = async () => {
    if (!conversationId || accepting || currentUserAccepted) return;

    setAccepting(true);
    setSendError(null);
    try {
      const res = await fetch(
        `/api/v1/chat/conversations/${conversationId}/accept`,
        {
          method: "PATCH",
          credentials: "include",
          headers: getCsrfHeaders(),
        },
      );

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        setSendError(error?.message || "Không thể thích cuộc trò chuyện");
        return;
      }

      await res.json().catch(() => null);
      setCurrentUserAccepted(true);
      await fetchConversationUser();
    } catch (error) {
      console.error("Error accepting conversation:", error);
      setSendError("Không thể thích cuộc trò chuyện");
    } finally {
      setAccepting(false);
    }
  };

  const handleMessageChange = (value: string) => {
    setNewMessage(value);
    setSendError(null);
    if (conversationEnded) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (!value.trim()) {
      lastTypingSentRef.current = 0;
      void sendTypingState(false);
      return;
    }

    const now = getTimestamp();
    if (now - lastTypingSentRef.current > 1200) {
      lastTypingSentRef.current = now;
      void sendTypingState(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      lastTypingSentRef.current = 0;
      void sendTypingState(false);
    }, 1800);
  };

  const handleEmojiSelect = (emoji: string) => {
    handleMessageChange(`${newMessage}${emoji}`);
    setShowEmojiPicker(false);
  };

  const handleEndConversation = async () => {
    if (!conversationId) {
      onBack?.();
      return;
    }

    const confirmed = window.confirm("Ban co muon thoat cuoc tro chuyen?");
    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/v1/chat/conversations/${conversationId}/end`,
        {
          method: "PATCH",
          credentials: "include",
          headers: getCsrfHeaders(),
        },
      );

      if (res.ok) {
        await leaveCurrentMatch();
        onBack?.();
        return;
      }

      const error = await res.json().catch(() => null);
      if (res.status === 404 || res.status === 403) {
        await leaveCurrentMatch();
        onBack?.();
        return;
      }
      window.alert(error?.message || "Không thể thoát cuộc trò chuyện");
    } catch {
      window.alert("Không thể thoát cuộc trò chuyện");
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      setConversationEnded(false);
      setLoading(true);
      setLoadError(null);
      void fetchMessages();
    });
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    if (!conversationId) return;

    eventSourceRef.current?.close();
    const source = new EventSource("/api/v1/chat/stream", {
      withCredentials: true,
    });

    eventSourceRef.current = source;

    source.addEventListener("chat", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data);

        if (payload?.type === "typing") {
          if (
            payload.conversationId === conversationId &&
            payload.userId !== userId
          ) {
            setOtherTyping(payload.isTyping === true);
          }
          return;
        }

        if (payload?.type === "conversation.ended") {
          if (payload.conversationId === conversationId) {
            setOtherTyping(false);
            setConversationEnded(true);
            if (payload.endedByUserId !== userId) {
              window.alert("Nguoi kia da thoat cuoc tro chuyen");
            }
          }
          return;
        }

        if (payload?.type === "conversation.accepted") {
          if (payload.conversationId === conversationId) {
            if (payload.acceptedByUserId === userId) {
              setCurrentUserAccepted(true);
            }
            if (payload.chatReady === true) {
              void fetchConversationUser();
            }
          }
          return;
        }

        const message = payload?.message as Message | undefined;

        if (!message || message.conversationId !== conversationId) {
          return;
        }

        setMessages((current) => {
          if (current.some((item) => item.id === message.id)) {
            return current;
          }
          return [...current, message];
        });
        setLoading(false);
      } catch (error) {
        console.error("Invalid chat stream event:", error);
      }
    });

    source.onerror = () => {
      source.close();
      eventSourceRef.current = null;
    };

    return () => {
      source.close();
      if (eventSourceRef.current === source) {
        eventSourceRef.current = null;
      }
    };
  }, [conversationId, fetchConversationUser, onBack, userId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchConversationUser();
    });
  }, [fetchConversationUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages),
    [messages],
  );

  return (
    <Flex
      direction="column"
      style={{
        height: "100%",
        maxHeight: "100%",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        background: bgPrimary,
      }}
    >
      {/* Header */}
      <Flex
        className="chat-sticky-header"
        align="center"
        gap="3"
        px="4"
        py="3"
        style={{
          borderBottom: `1px solid ${borderColor}`,
          background: bgSecondary,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="chat-icon-button"
            style={{ flexShrink: 0 }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={textSecondary}
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        {canViewProfile && visibleUser ? (
          <ProfileDialog
            user={visibleUser}
            accentColor={accentColor}
            textSecondary={textSecondary}
          >
            <AvatarButton
              user={visibleUser}
              accentColor={accentColor}
              getUserInitials={getUserInitials}
              title="Xem trang ca nhan"
            />
          </ProfileDialog>
        ) : (
          <Avatar
            size="2"
            radius="full"
            src={undefined}
            fallback="??"
            style={{ background: accentColor, color: "white" }}
          />
        )}
        <Flex direction="column" gap="0" style={{ flex: 1 }}>
          <Text size="3" weight="medium" style={{ color: textPrimary }}>
            {visibleUser?.fullName ||
              visibleUser?.email ||
              "Nguoi tro chuyen an danh"}
          </Text>
          {!canViewProfile && (
            <Text size="2" style={{ color: textSecondary }}>
              Bam Thich de xem ten va ho so
            </Text>
          )}
          {visibleUser?.city && (
            <Text size="2" style={{ color: textSecondary }}>
              Vi tri: {visibleUser.city}
            </Text>
          )}
          {otherTyping && (
            <Text size="2" style={{ color: accentColor }}>
              Đang nhập tin nhắn...
            </Text>
          )}
        </Flex>
        {otherUser && (
          <ReportUserDialog
            reportedUser={{
              id: otherUser.id,
              fullName: visibleUser?.fullName ?? null,
              email: visibleUser?.email ?? "",
              avatarUrl: visibleUser?.avatarUrl ?? null,
            }}
            recentPartners={[]}
          />
        )}
        {canViewProfile && visibleUser && (
          <ProfileDialog
            user={visibleUser}
            accentColor={accentColor}
            textSecondary={textSecondary}
          >
            <button
              type="button"
              className="chat-secondary-button"
              style={{
                minWidth: 92,
                height: 36,
                padding: "0 12px",
                flexShrink: 0,
              }}
            >
              Xem ho so
            </button>
          </ProfileDialog>
        )}
        {!canViewProfile && (
          <button
            onClick={handleAcceptConversation}
            disabled={currentUserAccepted || accepting}
            title="Thích để xem hồ sơ người đang trò chuyện"
            aria-label="Thich"
            className="chat-primary-button"
            style={{
              minWidth: 86,
              height: 36,
              background:
                currentUserAccepted || accepting
                  ? isDark
                    ? "#334155"
                    : "#e2e8f0"
                  : "linear-gradient(135deg, #22c55e, #10b981)",
              color: currentUserAccepted || accepting ? textSecondary : "white",
              cursor:
                currentUserAccepted || accepting ? "default" : "pointer",
              flexShrink: 0,
            }}
          >
            {currentUserAccepted ? "Đã thích" : accepting ? "..." : "Thích"}
          </button>
        )}
        <button
          onClick={handleEndConversation}
          className="chat-danger-button"
          title="Thoat cuoc tro chuyen"
          aria-label="Thoat cuoc tro chuyen"
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </Flex>

      {/* Messages */}
      <ScrollArea
        type="auto"
        scrollbars="vertical"
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Flex
          direction="column"
          gap="4"
          p="4"
          style={{
            background: bgPrimary,
            minHeight: "100%",
            minWidth: 0,
            overflowWrap: "anywhere",
          }}
        >
          {loading ? (
            <Flex
              align="center"
              justify="center"
              style={{ flex: 1, padding: 60 }}
            >
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: `3px solid ${borderColor}`,
                  borderTopColor: accentColor,
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </Flex>
          ) : loadError ? (
            <Box className="chat-empty-state" style={{ flex: 1 }}>
              <Box
                className="chat-empty-icon"
                style={{
                  color: "var(--chat-danger)",
                  background: "rgba(220, 38, 38, 0.1)",
                }}
              >
                !
              </Box>
              <Text size="3" weight="bold" style={{ color: textPrimary }}>
                Loi mang
              </Text>
              <Text size="2" className="chat-muted">
                {loadError}
              </Text>
              <button
                type="button"
                className="chat-secondary-button"
                onClick={() => {
                  setLoading(true);
                  void fetchMessages();
                }}
                style={{ height: 36, padding: "0 12px" }}
              >
                Thu lai
              </button>
            </Box>
          ) : messages.length === 0 ? (
            <Flex
              align="center"
              justify="center"
              direction="column"
              gap="4"
              style={{ flex: 1, padding: 60 }}
            >
              <Box
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 48,
                }}
              >
                👋
              </Box>
              <Text
                size="3"
                weight="medium"
                style={{ color: textSecondary, textAlign: "center" }}
              >
                Bat dau cuoc tro chuyen voi
              </Text>
              <Text size="4" weight="bold" style={{ color: textPrimary }}>
                {visibleUser?.fullName ||
                  visibleUser?.email ||
                  "nguoi tro chuyen an danh"}
              </Text>
            </Flex>
          ) : (
            <>
              {Object.entries(groupedMessages).map(
                ([dateKey, dateMessages]) => (
                  <Flex key={dateKey} direction="column" gap="3">
                    {/* Date separator */}
                    <Flex align="center" justify="center" my="2">
                      <Box
                        style={{
                          padding: "6px 16px",
                          borderRadius: "20px",
                          background: isDark
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.05)",
                        }}
                      >
                        <Text size="1" style={{ color: textSecondary }}>
                          {formatDate(dateMessages[0].createdAt)}
                        </Text>
                      </Box>
                    </Flex>

                    {dateMessages.map((msg) => {
                      const isMe = msg.senderId === userId;
                      return (
                        <Flex
                          key={msg.id}
                          justify={isMe ? "end" : "start"}
                          gap="2"
                          style={{
                            maxWidth: "75%",
                            marginLeft: isMe ? "auto" : "0",
                            minWidth: 0,
                          }}
                        >
                          {!isMe && (
                            <Avatar
                              size="1"
                              radius="full"
                              src={visibleUser?.avatarUrl || undefined}
                              fallback={getUserInitials(
                                visibleUser?.fullName,
                                visibleUser?.email || "??",
                              )}
                              style={{
                                background: accentColor,
                                color: "white",
                                alignSelf: "flex-end",
                              }}
                            />
                          )}
                          <Box
                            p="3"
                            style={{
                              borderRadius: "18px",
                              background: isMe ? bgMessageMe : bgMessageOther,
                              color: isMe ? textOnPrimary : textPrimary,
                              maxWidth: "100%",
                              overflowWrap: "anywhere",
                              boxShadow: isMe
                                ? "0 4px 20px rgba(99, 102, 241, 0.3)"
                                : "0 2px 10px rgba(0,0,0,0.05)",
                              borderBottomRightRadius: isMe ? "6px" : "18px",
                              borderBottomLeftRadius: isMe ? "18px" : "6px",
                            }}
                          >
                            <Text size="3" style={{ lineHeight: 1.5 }}>
                              {msg.content}
                            </Text>
                            <Text
                              size="1"
                              style={{
                                opacity: 0.7,
                                marginTop: 4,
                                display: "block",
                                textAlign: isMe ? "right" : "left",
                                fontSize: "11px",
                              }}
                            >
                              {formatTime(msg.createdAt)}
                            </Text>
                          </Box>
                        </Flex>
                      );
                    })}
                  </Flex>
                ),
              )}
              {otherTyping && (
                <Flex justify="start" gap="2" style={{ maxWidth: "75%", minWidth: 0 }}>
                  <Avatar
                    size="1"
                    radius="full"
                    src={visibleUser?.avatarUrl || undefined}
                    fallback={getUserInitials(
                      visibleUser?.fullName,
                      visibleUser?.email || "??",
                    )}
                    style={{
                      background: accentColor,
                      color: "white",
                      alignSelf: "flex-end",
                    }}
                  />
                  <Box
                    p="3"
                    style={{
                      background: bgMessageOther,
                      borderRadius: "18px",
                      borderBottomLeftRadius: 6,
                      color: textSecondary,
                      maxWidth: "100%",
                    }}
                  >
                    <Flex align="center" gap="2">
                      <TypingDots color={accentColor} />
                      <Text size="2">Đang nhập dữ liệu...</Text>
                    </Flex>
                  </Box>
                </Flex>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </Flex>
      </ScrollArea>

      {/* Input */}
      <Flex
        className="chat-sticky-input"
        align="center"
        gap="3"
        px="4"
        py="3"
        style={{
          borderTop: `1px solid ${borderColor}`,
          background: bgSecondary,
          flexShrink: 0,
          position: "relative",
        }}
      >
        {conversationEnded && (
          <Text
            size="2"
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: 72,
              color: "#92400e",
              background: isDark ? "rgba(120, 53, 15, 0.92)" : "#fef3c7",
              border: `1px solid ${isDark ? "rgba(251, 191, 36, 0.35)" : "#fde68a"}`,
              borderRadius: 10,
              padding: "8px 12px",
              zIndex: 16,
            }}
          >
            Cuoc tro chuyen da ket thuc. Ban khong the gui tin nhan nua.
          </Text>
        )}
        {sendError && (
          <Text
            size="2"
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: 72,
              color: "#ef4444",
              background: isDark ? "rgba(127, 29, 29, 0.92)" : "#fee2e2",
              border: `1px solid ${isDark ? "rgba(248, 113, 113, 0.35)" : "#fecaca"}`,
              borderRadius: 10,
              padding: "8px 12px",
              zIndex: 15,
            }}
          >
            {sendError}
          </Text>
        )}
        <TextField.Root
          disabled={conversationEnded}
          placeholder={conversationEnded ? "Cuoc tro chuyen da ket thuc" : "Nhap tin nhan..."}
          value={newMessage}
          onChange={(e) => handleMessageChange(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            background: bgPrimary,
            border: `1px solid ${borderColor}`,
            borderRadius: "24px",
          }}
        />
        <Box style={{ position: "relative", flexShrink: 0 }}>
          <button
            type="button"
            disabled={conversationEnded}
            onClick={() => setShowEmojiPicker((current) => !current)}
            title="Gui icon"
            aria-label="Gui icon"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: isDark ? "#1f2937" : "#eef2ff",
              border: `1px solid ${borderColor}`,
              cursor: conversationEnded ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accentColor,
              transition: "all 0.2s ease",
            }}
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
          {showEmojiPicker && (
            <Box
              style={{
                position: "absolute",
                right: 0,
                bottom: 52,
                width: 232,
                padding: 10,
                borderRadius: 14,
                background: bgSecondary,
                border: `1px solid ${borderColor}`,
                boxShadow: isDark
                  ? "0 18px 48px rgba(0,0,0,0.45)"
                  : "0 18px 48px rgba(15,23,42,0.14)",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
                zIndex: 20,
              }}
            >
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  style={{
                    width: 46,
                    height: 40,
                    borderRadius: 10,
                    border: "none",
                    background: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc",
                    cursor: "pointer",
                    fontSize: 22,
                    lineHeight: 1,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </Box>
          )}
        </Box>
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending || conversationEnded}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background:
              newMessage.trim() && !sending && !conversationEnded
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : isDark
                  ? "#374151"
                  : "#e2e8f0",
            border: "none",
            cursor: newMessage.trim() && !sending && !conversationEnded ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              newMessage.trim() && !sending && !conversationEnded
                ? "0 4px 16px rgba(99, 102, 241, 0.4)"
                : "none",
            transition: "all 0.3s ease",
            flexShrink: 0,
          }}
        >
          {sending ? (
            <Box
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "3px solid white",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Flex>
    </Flex>
  );
}

function getCsrfHeaders(): HeadersInit {
  const csrfToken = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("csrf_token="))
    ?.split("=")
    .slice(1)
    .join("=");

  return csrfToken
    ? {
        "X-CSRF-Token": decodeURIComponent(csrfToken),
      }
    : {};
}

function getTimestamp() {
  return Date.now();
}

function AvatarButton({
  user,
  accentColor,
  getUserInitials,
  title,
}: {
  user: MatchedUser;
  accentColor: string;
  getUserInitials: (name: string | null | undefined, email: string) => string;
  title: string;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      title={title}
      aria-label={title}
      style={{
        display: "inline-flex",
        cursor: "pointer",
        borderRadius: "50%",
        lineHeight: 0,
      }}
    >
      <Avatar
        size="2"
        radius="full"
        src={user.avatarUrl || undefined}
        fallback={getUserInitials(user.fullName, user.email || "??")}
        style={{ background: accentColor, color: "white" }}
      />
    </span>
  );
}

function ProfileDialog({
  user,
  accentColor,
  textSecondary,
  children,
}: {
  user: MatchedUser;
  accentColor: string;
  textSecondary: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Content style={{ maxWidth: 460 }}>
        <Dialog.Title>Trang ca nhan</Dialog.Title>
        <Flex direction="column" gap="4">
          <Flex align="center" gap="3">
            <Avatar
              size="5"
              radius="full"
              src={user.avatarUrl || undefined}
              fallback={(user.fullName || user.email || "??").slice(0, 2)}
              style={{ background: accentColor, color: "white" }}
            />
            <Flex direction="column" gap="1">
              <Text size="5" weight="bold">
                {user.fullName || user.email || "Người dùng"}
              </Text>
              {user.city && (
                <Badge color="indigo" variant="soft">
                  {user.city}
                </Badge>
              )}
            </Flex>
          </Flex>

          <Flex direction="column" gap="2">
            <ProfileField label="Email" value={user.email || "Chưa có"} />
            <ProfileField
              label="Giới tính"
              value={formatGender(user.gender) || "Chưa cập nhật"}
            />
            <ProfileField label="Vị trí" value={formatCity(user.city) || "Chưa cập nhật"} />
            {user.dateOfBirth && (
              <ProfileField
                label="Ngày sinh"
                value={new Date(user.dateOfBirth).toLocaleDateString("vi-VN")}
              />
            )}
            {user.phoneNumber && (
              <ProfileField label="Số điện thoại" value={user.phoneNumber} />
            )}
          </Flex>

          <Box
            style={{
              border: "1px solid rgba(99,102,241,0.18)",
              borderRadius: 8,
              padding: 12,
              background: "rgba(99,102,241,0.06)",
            }}
          >
            <Text size="1" style={{ color: textSecondary }}>
              Giới thiệu
            </Text>
            <Text size="2" style={{ display: "block", marginTop: 4 }}>
              {user.bio || "Người này chưa thêm giới thiệu."}
            </Text>
          </Box>

          <Flex justify="end">
            <Dialog.Close>
              <button
                type="button"
                style={{
                  height: 36,
                  padding: "0 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </Dialog.Close>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <Flex direction="column" gap="0">
      <Text size="1" color="gray">
        {label}
      </Text>
      <Text size="2">{value}</Text>
    </Flex>
  );
}

function TypingDots({ color }: { color: string }) {
  return (
    <Flex align="center" gap="1" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          style={{
            animation: "typing-dot 1s ease-in-out infinite",
            animationDelay: `${index * 0.16}s`,
            background: color,
            borderRadius: "50%",
            height: 6,
            opacity: 0.45,
            width: 6,
          }}
        />
      ))}
      <style>{`
        @keyframes typing-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </Flex>
  );
}

function formatGender(gender: string | null | undefined): string | null {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";
  if (gender === "other") return "Khác";
  return null;
}

function formatCity(city: string | null | undefined): string {
  if (city === "TP. Ho Chi Minh") return "TP. Hồ Chí Minh";
  if (city === "Ha Noi") return "Hà Nội";
  return city || "";
}
