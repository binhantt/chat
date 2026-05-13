"use client";

import { Flex, Text, TextField, Box, Avatar, ScrollArea } from "@radix-ui/themes";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
}

interface ConversationUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  gender?: string | null;
  city?: string | null;
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

export function ChatArea({ selectedUser, matchedUser, conversationId, onBack }: ChatAreaProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [resolvedUser, setResolvedUser] = useState<MatchedUser | null>(matchedUser ?? null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef(0);
  const emojiOptions = ["😀", "😂", "😍", "🥰", "😎", "😭", "😡", "👍", "👏", "🙏", "❤️", "🔥", "✨", "🎉", "💬", "✅"];

  const otherUser = resolvedUser ?? matchedUser;

  // Theme colors
  const bgPrimary = isDark ? "#1a1a2e" : "#f8fafc";
  const bgSecondary = isDark ? "#16213e" : "#ffffff";
  const bgMessageMe = isDark ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "linear-gradient(135deg, #6366f1, #8b5cf6)";
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
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString("vi-VN", { day: "numeric", month: "long" });
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
    if (!conversationId || !user?.id) {
      setResolvedUser(matchedUser ?? null);
      return;
    }

    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}`, {
        credentials: "include",
      });

      if (!res.ok) return;

      const conversation = (await res.json()) as ConversationDetail;
      const isUser1 = conversation.user1Id === user.id;
      const partner = isUser1 ? conversation.user2 : conversation.user1;
      const partnerId = isUser1 ? conversation.user2Id : conversation.user1Id;
      const chatReady =
        conversation.user1Accepted === true && conversation.user2Accepted === true;

      setResolvedUser({
        id: partner?.id || partnerId,
        email: chatReady ? partner?.email || "" : "",
        fullName: chatReady ? partner?.fullName || null : null,
        avatarUrl: chatReady ? partner?.avatarUrl || null : null,
        gender: chatReady ? partner?.gender || null : null,
        city: partner?.city || matchedUser?.city || null,
      });
    } catch (error) {
      console.error("Error fetching conversation user:", error);
    }
  }, [conversationId, matchedUser, user?.id]);

  const fetchMessages = useCallback(async (retryCount = 0) => {
    if (!conversationId) {
      onBack?.();
      return;
    }

    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        credentials: "include",
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data.reverse() : []);
        setLoading(false);
        return;
      }

      if (retryCount < 3) {
        await new Promise(r => setTimeout(r, 1000));
        fetchMessages(retryCount + 1);
      } else {
        setLoading(false);
      }
    } catch {
      if (retryCount < 3) {
        await new Promise(r => setTimeout(r, 1500));
        fetchMessages(retryCount + 1);
      } else {
        setLoading(false);
      }
    }
  }, [conversationId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || sending) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setSending(true);
    setSendError(null);
    try {
      await sendTypingState(false);
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (res.ok) {
        setNewMessage("");
      } else {
        const error = await res.json();
        setSendError(error.message || "Không thể gửi tin nhắn");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSendError("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  const sendTypingState = useCallback(async (isTyping: boolean) => {
    if (!conversationId) return;

    try {
      await fetch(`/api/chat/conversations/${conversationId}/typing`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping }),
      });
    } catch {
      // Typing is a soft realtime signal, so failed requests should not block chat.
    }
  }, [conversationId]);

  const handleMessageChange = (value: string) => {
    setNewMessage(value);
    setSendError(null);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (!value.trim()) {
      lastTypingSentRef.current = 0;
      void sendTypingState(false);
      return;
    }

    const now = Date.now();
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

    const confirmed = window.confirm("Bạn có muốn thoát cuộc trò chuyện?");
    if (!confirmed) return;

    try {
      await sendTypingState(false);
      const res = await fetch(`/api/chat/conversations/${conversationId}/end`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        onBack?.();
        return;
      }

      const error = await res.json().catch(() => null);
      if (res.status === 404 || res.status === 403) {
        onBack?.();
        return;
      }
      window.alert(error?.message || "Không thể thoát cuộc trò chuyện");
    } catch {
      window.alert("Không thể thoát cuộc trò chuyện");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    if (!conversationId) return;

    eventSourceRef.current?.close();
    const source = new EventSource("/api/chat/stream", {
      withCredentials: true,
    });

    eventSourceRef.current = source;

    source.addEventListener("chat", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data);

        if (payload?.type === "typing") {
          if (payload.conversationId === conversationId && payload.userId !== user?.id) {
            setOtherTyping(payload.isTyping === true);
          }
          return;
        }

        if (payload?.type === "conversation.ended") {
          if (payload.conversationId === conversationId) {
            setOtherTyping(false);
            if (payload.endedByUserId !== user?.id) {
              window.alert("Người kia đã thoát cuộc trò chuyện");
            }
            onBack?.();
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
  }, [conversationId, onBack, user?.id]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      void sendTypingState(false);
    };
  }, [sendTypingState]);

  useEffect(() => {
    void fetchConversationUser();
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

  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  return (
    <Flex direction="column" style={{ height: "100%", background: bgPrimary }}>
      {/* Header */}
      <Flex
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
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "transparent",
              border: `1px solid ${borderColor}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={textSecondary} strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <Avatar
          size="2"
          radius="full"
          src={otherUser?.avatarUrl || undefined}
          fallback={getUserInitials(otherUser?.fullName, otherUser?.email || "??")}
          style={{ background: accentColor, color: "white" }}
        />
        <Flex direction="column" gap="0" style={{ flex: 1 }}>
          <Text size="3" weight="medium" style={{ color: textPrimary }}>
            {otherUser?.fullName || otherUser?.email || "Người trò chuyện"}
          </Text>
          {otherUser?.city && (
            <Text size="2" style={{ color: textSecondary }}>
              📍 {otherUser.city}
            </Text>
          )}
          {otherTyping && (
            <Text size="2" style={{ color: accentColor }}>
              Đang nhập...
            </Text>
          )}
        </Flex>
        {otherUser && (
          <ReportUserDialog
            reportedUser={{
              id: otherUser.id,
              fullName: otherUser.fullName,
              email: otherUser.email,
              avatarUrl: otherUser.avatarUrl,
            }}
            recentPartners={[]}
          />
        )}
        <button
          onClick={handleEndConversation}
          title="Thoát cuộc trò chuyện"
          aria-label="Thoát cuộc trò chuyện"
          style={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: isDark ? "rgba(248, 113, 113, 0.12)" : "#fee2e2",
            border: `1px solid ${isDark ? "rgba(248, 113, 113, 0.28)" : "#fecaca"}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </Flex>

      {/* Messages */}
      <ScrollArea style={{ flex: 1 }}>
        <Flex
          direction="column"
          gap="4"
          p="4"
          style={{ background: bgPrimary, minHeight: "100%" }}
        >
          {loading ? (
            <Flex align="center" justify="center" style={{ flex: 1, padding: 60 }}>
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
          ) : messages.length === 0 ? (
            <Flex align="center" justify="center" direction="column" gap="4" style={{ flex: 1, padding: 60 }}>
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
              <Text size="3" weight="medium" style={{ color: textSecondary, textAlign: "center" }}>
                Bắt đầu cuộc trò chuyện với
              </Text>
              <Text size="4" weight="bold" style={{ color: textPrimary }}>
                {otherUser?.fullName || otherUser?.email || "người trò chuyện"}
              </Text>
            </Flex>
          ) : (
            <>
              {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
                <Flex key={dateKey} direction="column" gap="3">
                  {/* Date separator */}
                  <Flex align="center" justify="center" my="2">
                    <Box
                      style={{
                        padding: "6px 16px",
                        borderRadius: "20px",
                        background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                      }}
                    >
                      <Text size="1" style={{ color: textSecondary }}>
                        {formatDate(dateMessages[0].createdAt)}
                      </Text>
                    </Box>
                  </Flex>

                  {dateMessages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <Flex
                        key={msg.id}
                        justify={isMe ? "end" : "start"}
                        gap="2"
                        style={{
                          maxWidth: "75%",
                          marginLeft: isMe ? "auto" : "0",
                        }}
                      >
                        {!isMe && (
                          <Avatar
                            size="1"
                            radius="full"
                            src={otherUser?.avatarUrl || undefined}
                            fallback={getUserInitials(otherUser?.fullName, otherUser?.email || "??")}
                            style={{ background: accentColor, color: "white", alignSelf: "flex-end" }}
                          />
                        )}
                        <Box
                          p="3"
                          style={{
                            borderRadius: "18px",
                            background: isMe ? bgMessageMe : bgMessageOther,
                            color: isMe ? textOnPrimary : textPrimary,
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
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </Flex>
      </ScrollArea>

      {/* Input */}
      <Flex
        align="center"
        gap="3"
        px="4"
        py="3"
        style={{
          borderTop: `1px solid ${borderColor}`,
          background: bgSecondary,
          position: "relative",
        }}
      >
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
          placeholder="Nhập tin nhắn..."
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
            onClick={() => setShowEmojiPicker((current) => !current)}
            title="Gửi icon"
            aria-label="Gửi icon"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: isDark ? "#1f2937" : "#eef2ff",
              border: `1px solid ${borderColor}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accentColor,
              transition: "all 0.2s ease",
            }}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                boxShadow: isDark ? "0 18px 48px rgba(0,0,0,0.45)" : "0 18px 48px rgba(15,23,42,0.14)",
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
          disabled={!newMessage.trim() || sending}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: newMessage.trim() && !sending
              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
              : isDark ? "#374151" : "#e2e8f0",
            border: "none",
            cursor: newMessage.trim() && !sending ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: newMessage.trim() && !sending
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
