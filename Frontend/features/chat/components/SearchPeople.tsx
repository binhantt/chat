"use client";

import { Avatar, Badge, Box, Flex, Text } from "@radix-ui/themes";
import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons";
import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { getConversations } from "@/features/athu";
import { useAuth } from "@/contexts/AuthContext";
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
  preview: string;
  unreadCount: number;
}

interface SearchPeopleProps {
  selectedConversationId?: string | null;
  showSearchHeader?: boolean;
  onSelectConversation?: (
    conversationId: string,
    partner: {
      id: string;
      email: string;
      fullName: string | null;
      avatarUrl: string | null;
      gender: string | null;
      city: string | null;
    },
  ) => void;
}

export const SearchPeople = memo(function SearchPeople({
  selectedConversationId,
  showSearchHeader = false,
  onSelectConversation,
}: SearchPeopleProps) {
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<ChatPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query);
  const { user } = useAuth();

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConversations();
      if (!Array.isArray(data)) {
        setConversations([]);
        return;
      }

      const formatted: ChatPartner[] = data
        .filter((conv: BackendConversation) => conv.status === "active")
        .map((conv: BackendConversation) => {
          const isUser1 = conv.user1Id === user?.id;
          const partner = isUser1 ? conv.user2 : conv.user1;
          const partnerId = isUser1 ? conv.user2Id : conv.user1Id;
          const chatReady =
            conv.user1Accepted === true && conv.user2Accepted === true;
          const name = chatReady
            ? partner?.fullName || partner?.email || "Nguoi dung"
            : "Nguoi an danh";

          return {
            conversationId: conv.id,
            partnerId,
            partnerName: name,
            partnerEmail: chatReady ? partner?.email || "" : "",
            partnerAvatar: chatReady ? partner?.avatarUrl || null : null,
            partnerCity: chatReady ? partner?.city || null : null,
            chatReady,
            lastTime: formatTimeAgo(conv.updatedAt),
            status: conv.status,
            preview: chatReady
              ? partner?.city
                ? `Vi tri: ${partner.city}`
                : "San sang tro chuyen"
              : "An danh den khi ca hai cung thich",
            unreadCount: 0,
          };
        });

      setConversations(formatted);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Khong tai duoc danh sach hoi thoai");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      void fetchConversations();
    }
  }, [user, fetchConversations]);

  useEffect(() => {
    if (!user) return;

    const source = new EventSource("/api/v1/chat/stream", {
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
      } catch (err) {
        console.error("Invalid chat stream event:", err);
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

    return conversations.filter(
      (c) =>
        c.partnerName.toLowerCase().includes(normalizedQuery) ||
        c.partnerEmail.toLowerCase().includes(normalizedQuery) ||
        c.partnerCity?.toLowerCase().includes(normalizedQuery),
    );
  }, [conversations, debouncedQuery]);

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
    <Flex direction="column" gap="3" style={{ minHeight: 0, width: "100%" }}>
      {showSearchHeader && (
        <Flex direction="column" gap="1">
          <Text size="5" weight="bold">
            Tim kiem cuoc tro chuyen
          </Text>
          <Text size="2" className="chat-muted">
            Loc theo ten, email hoac vi tri cua nguoi da chat.
          </Text>
        </Flex>
      )}

      <Box style={{ position: "relative" }}>
        <MagnifyingGlassIcon
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--chat-muted)",
          }}
        />
        <input
          className="chat-search-input"
          type="text"
          placeholder="Tim hoi thoai..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            className="chat-icon-button"
            onClick={() => setQuery("")}
            aria-label="Xoa tim kiem"
            title="Xoa tim kiem"
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              width: 30,
              height: 30,
              transform: "translateY(-50%)",
            }}
          >
            <Cross2Icon />
          </button>
        )}
      </Box>

      <Box
        style={{
          minHeight: 0,
          overflow: "auto",
          border: "1px solid var(--chat-border)",
          borderRadius: "var(--chat-radius)",
          background: "var(--chat-surface)",
        }}
      >
        {loading ? (
          <ListState title="Dang tai" detail="Dang lay danh sach hoi thoai..." />
        ) : error ? (
          <ListState title="Loi mang" detail={error} danger />
        ) : filtered.length === 0 ? (
          <ListState
            title={query ? "Khong co ket qua" : "Chua co hoi thoai"}
            detail={
              query
                ? "Thu tu khoa khac de tim lai nguoi da chat."
                : "Bam Tim moi de ghep nguoi va bat dau chat."
            }
          />
        ) : (
          <Flex direction="column">
            {filtered.map((chat) => (
              <button
                key={chat.conversationId}
                type="button"
                className="chat-list-item"
                data-active={chat.conversationId === selectedConversationId}
                onClick={() => handleSelectConversation(chat)}
              >
                <Avatar
                  size="3"
                  radius="full"
                  src={chat.partnerAvatar || undefined}
                  fallback={getUserInitials(chat.partnerName)}
                  style={{
                    background: "var(--chat-accent)",
                    color: "white",
                    fontWeight: 700,
                  }}
                />

                <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                  <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                    <Text
                      size="2"
                      weight="bold"
                      className="chat-list-title"
                      style={{ color: "var(--chat-text)" }}
                    >
                      {chat.partnerName}
                    </Text>
                    {!chat.chatReady && (
                      <Badge color="gray" variant="soft">
                        Cho thich
                      </Badge>
                    )}
                  </Flex>
                  <Text size="1" className="chat-muted chat-list-preview">
                    {chat.preview}
                  </Text>
                </Flex>

                <Flex direction="column" align="end" gap="2">
                  <Text size="1" className="chat-muted">
                    {chat.lastTime}
                  </Text>
                  {chat.unreadCount > 0 && (
                    <Badge color="indigo" variant="solid">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </Flex>
              </button>
            ))}
          </Flex>
        )}
      </Box>
    </Flex>
  );
});

function ListState({
  title,
  detail,
  danger = false,
}: {
  title: string;
  detail: string;
  danger?: boolean;
}) {
  return (
    <Box className="chat-empty-state" style={{ minHeight: 180 }}>
      <Box
        className="chat-empty-icon"
        style={{
          color: danger ? "var(--chat-danger)" : undefined,
          background: danger ? "rgba(220, 38, 38, 0.1)" : undefined,
        }}
      >
        <ChatBubbleMini />
      </Box>
      <Flex direction="column" gap="1" align="center">
        <Text size="3" weight="bold">
          {title}
        </Text>
        <Text size="2" className="chat-muted">
          {detail}
        </Text>
      </Flex>
    </Box>
  );
}

function ChatBubbleMini() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function getUserInitials(name: string) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Moi";
  if (diffMins < 60) return `${diffMins}p`;
  if (diffHours < 24) return `${diffHours}g`;
  if (diffDays < 7) return `${diffDays}n`;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}
