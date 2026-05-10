"use client";

import { Flex, Text, TextField, Box, Avatar, ScrollArea } from "@radix-ui/themes";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const otherUser = matchedUser;

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

      // Retry up to 3 times if fetch failed
      if (retryCount < 3) {
        await new Promise(r => setTimeout(r, 1000));
        fetchMessages(retryCount + 1);
      } else {
        setLoading(false);
      }
    } catch {
      // Network error - retry a few times
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

  return (
    <Flex direction="column" style={{ height: "100%" }}>
      {/* Header */}
      <Flex
        align="center"
        gap="3"
        px="4"
        py="3"
        style={{
          borderBottom: "1px solid var(--indigo-5)",
          background: "var(--bg-secondary, var(--white))",
        }}
      >
        <Avatar
          size="2"
          radius="full"
          src={otherUser?.avatarUrl || undefined}
          fallback={getUserInitials(otherUser?.fullName, otherUser?.email || "??")}
          style={{ background: "var(--indigo-9)", color: "white" }}
        />
        <Flex direction="column" gap="0" style={{ flex: 1 }}>
          <Text size="3" weight="medium">
            {otherUser?.fullName || otherUser?.email || "Người trò chuyện"}
          </Text>
          {otherUser?.city && (
            <Text size="1" color="gray">
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
          gap="3"
          p="4"
          style={{ background: "var(--bg-primary, var(--gray-1))", minHeight: "100%" }}
        >
          {loading ? (
            <Flex align="center" justify="center" style={{ flex: 1 }}>
              <Text size="2" color="gray">Đang tải tin nhắn...</Text>
            </Flex>
          ) : messages.length === 0 ? (
            <Flex align="center" justify="center" direction="column" gap="2" style={{ flex: 1, padding: 40 }}>
              <Box style={{ fontSize: 48 }}>👋</Box>
              <Text size="2" color="gray" align="center">
                Bắt đầu cuộc trò chuyện với {(otherUser?.fullName || otherUser?.email || "người trò chuyện")}
              </Text>
            </Flex>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <Flex
                  key={msg.id}
                  justify={isMe ? "end" : "start"}
                >
                  <Box
                    p="3"
                    style={{
                      maxWidth: "70%",
                      borderRadius: "var(--radius-3)",
                      background: isMe
                        ? "linear-gradient(135deg, var(--indigo-9), var(--violet-9))"
                        : "var(--bg-secondary, var(--white))",
                      color: isMe ? "white" : "var(--text-primary, var(--gray-12))",
                      boxShadow: isMe
                        ? "0 4px 16px rgba(99,102,241,0.25)"
                        : "0 2px 8px rgba(0,0,0,0.06)",
                      borderBottomRightRadius: isMe ? "4px" : "var(--radius-3)",
                      borderBottomLeftRadius: isMe ? "var(--radius-3)" : "4px",
                    }}
                  >
                    <Text size="2">{msg.content}</Text>
                    <Text
                      size="1"
                      style={{
                        opacity: 0.7,
                        marginTop: 4,
                        display: "block",
                        textAlign: "right"
                      }}
                    >
                      {formatTime(msg.createdAt)}
                    </Text>
                  </Box>
                </Flex>
              );
            })
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
          borderTop: "1px solid var(--indigo-5)",
          background: "var(--bg-secondary, var(--white))",
        }}
      >
        <TextField.Root
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
        />
        <Box
          as="button"
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending}
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--radius-2)",
            background: newMessage.trim() && !sending
              ? "linear-gradient(135deg, var(--indigo-9), var(--violet-9))"
              : "var(--gray-5)",
            border: "none",
            cursor: newMessage.trim() && !sending ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: newMessage.trim() && !sending
              ? "0 4px 12px rgba(99,102,241,0.3)"
              : "none",
            transition: "all 0.2s",
          }}
        >
          {sending ? (
            <Box style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid white", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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