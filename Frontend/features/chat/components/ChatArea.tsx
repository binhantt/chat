"use client";

import { Flex, Text, TextField, Box, Avatar, ScrollArea } from "@radix-ui/themes";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ReportUserDialog } from "@/features/report/components/ReportUserDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const otherUser = matchedUser;

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
    if (!name) return email.slice(0, 2).toUpperCase();
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

  const fetchMessages = useCallback(async (retryCount = 0) => {
    if (!conversationId) return;

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

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 5000);
  }, [fetchMessages]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      } else {
        const error = await res.json();
        console.error("Error sending message:", error.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    startPolling();
    return () => {
      stopPolling();
    };
  }, [conversationId, fetchMessages, startPolling, stopPolling]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

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
          <Box
            as="button"
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
          </Box>
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
        }}
      >
        <TextField.Root
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            background: bgPrimary,
            border: `1px solid ${borderColor}`,
            borderRadius: "24px",
          }}
        />
        <Box
          as="button"
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
        </Box>
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