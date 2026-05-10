"use client";

import { Flex, Text, TextField, Box, Avatar, Spinner, Badge } from "@radix-ui/themes";
import { MagnifyingGlassIcon, ChatBubbleIcon } from "@radix-ui/react-icons";
import { useState, useEffect, useCallback } from "react";
import { getConversations } from "@/features/athu";
import { useAuth } from "@/contexts/AuthContext";

interface BackendConversation {
  id: string;
  user1Id: string;
  user2Id: string;
  user1?: { id: string; email: string; fullName: string | null; avatarUrl: string | null };
  user2?: { id: string; email: string; fullName: string | null; avatarUrl: string | null };
  status: "active" | "ended" | "blocked";
  createdAt: string;
  updatedAt: string;
}

interface ChatPartner {
  conversationId: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  partnerAvatar: string | null;
  lastTime: string;
  status: "active" | "ended" | "blocked";
}

export function SearchPeople() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatPartner[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConversations();
      if (Array.isArray(data)) {
        const formatted: ChatPartner[] = data.map((conv: BackendConversation) => {
          const isUser1 = conv.user1Id === user?.id;
          const partner = isUser1 ? conv.user2 : conv.user1;
          const partnerId = isUser1 ? conv.user2Id : conv.user1Id;

          return {
            conversationId: conv.id,
            partnerId,
            partnerName: partner?.fullName || partner?.email?.split("@")[0] || `User ${partnerId.slice(0, 8)}`,
            partnerEmail: partner?.email || "",
            partnerAvatar: partner?.avatarUrl || null,
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
    if (open && user) {
      fetchConversations();
    }
  }, [open, user, fetchConversations]);

  const filtered = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(query.toLowerCase()) ||
    c.partnerEmail.toLowerCase().includes(query.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  return (
    <Box position="relative">
      <TextField.Root
        placeholder="Tìm kiếm cuộc trò chuyện..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          if (user) fetchConversations();
        }}
        style={{
          background: "var(--bg-secondary, var(--white))",
          borderRadius: "var(--radius-3)",
        }}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon width={16} height={16} color="var(--gray-9)" />
        </TextField.Slot>
      </TextField.Root>

      {open && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left="0"
          right="0"
          style={{
            background: "var(--bg-secondary, var(--white))",
            borderRadius: "var(--radius-3)",
            boxShadow: "0 8px 24px rgba(99,102,241,0.12)",
            zIndex: 100,
            maxHeight: 400,
            overflowY: "auto",
            border: "1px solid var(--indigo-5)",
          }}
        >
          {loading ? (
            <Flex p="5" align="center" justify="center" direction="column" gap="3">
              <Spinner size="3" />
              <Text size="2" color="gray">Đang tải lịch sử trò chuyện...</Text>
            </Flex>
          ) : filtered.length === 0 && query ? (
            <Flex p="4" align="center" justify="center" direction="column" gap="2">
              <Text size="2" color="gray">Không tìm thấy cuộc trò chuyện nào</Text>
              <Text size="1" color="gray">Thử tìm kiếm với từ khóa khác</Text>
            </Flex>
          ) : filtered.length === 0 ? (
            <Flex p="4" align="center" justify="center" direction="column" gap="2">
              <ChatBubbleIcon width={32} height={32} color="var(--gray-6)" />
              <Text size="2" color="gray">Chưa có cuộc trò chuyện nào</Text>
              <Text size="1" color="gray">Bắt đầu trò chuyện mới với Ghép đôi ngẫu nhiên</Text>
            </Flex>
          ) : (
            filtered.map((chat) => (
              <ConversationItem
                key={chat.conversationId}
                chat={chat}
                onClose={() => {
                  setOpen(false);
                  setQuery("");
                }}
              />
            ))
          )}
        </Box>
      )}
    </Box>
  );
}

function ConversationItem({
  chat,
  onClose,
}: {
  chat: ChatPartner;
  onClose: () => void;
}) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    onClose();
    window.location.href = `/chat?conv=${chat.conversationId}&user=${chat.partnerId}`;
  };

  const statusColor = {
    active: "green",
    ended: "gray",
    blocked: "red",
  } as const;

  return (
    <Flex
      align="center"
      gap="3"
      px="4"
      py="3"
      onClick={handleClick}
      style={{
        cursor: "pointer",
        borderBottom: "1px solid var(--indigo-4)",
        transition: "background 0.15s",
        background: "transparent",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "var(--indigo-2)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      <Box position="relative">
        <Avatar
          size="2"
          radius="full"
          fallback={chat.partnerName.slice(0, 2).toUpperCase()}
          color="indigo"
          src={chat.partnerAvatar || undefined}
          style={{
            background: "linear-gradient(135deg, var(--indigo-6), var(--violet-6))",
            color: "white",
          }}
        />
        <Box
          position="absolute"
          bottom="0"
          right="0"
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: chat.status === "active" ? "var(--green-9)" : "var(--gray-7)",
            border: "2px solid var(--bg-secondary, var(--white))",
          }}
        />
      </Box>

      <Flex direction="column" gap="0" style={{ flex: 1 }}>
        <Flex align="center" gap="2">
          <Text size="2" weight="medium">{chat.partnerName}</Text>
          <Badge color={statusColor[chat.status]} variant="soft" size="1">
            {chat.status === "active" ? "Hoạt động" : chat.status === "ended" ? "Đã kết thúc" : "Đã chặn"}
          </Badge>
        </Flex>
        <Text
          size="1"
          color="gray"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 200,
          }}
        >
          {chat.partnerEmail}
        </Text>
      </Flex>

      <Text size="1" color="gray">{chat.lastTime}</Text>
    </Flex>
  );
}
