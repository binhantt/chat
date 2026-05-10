"use client";

import { Flex, Text, Box, Card, Heading, Button, Callout, Badge, TextField, Avatar } from "@radix-ui/themes";
import { ReloadIcon, EyeOpenIcon, LockClosedIcon, MagnifyingGlassIcon, ChatBubbleIcon } from "@radix-ui/react-icons";
import { useState, useEffect, useCallback } from "react";
import { getConversations, type Conversation } from "@/features/athu";
import { ChatDetailDialog } from "../components/chat";

function formatTimeAgo(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return then.toLocaleDateString("vi-VN");
}

function getInitials(name: string | null | undefined, fallback: string) {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return fallback.slice(0, 2).toUpperCase();
}

export function ChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "ended" | "blocked">("all");
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Không thể tải danh sách cuộc trò chuyện");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const filtered = conversations.filter((c) => {
    const user1Info = c.user1?.fullName || c.user1?.email || c.user1Id || "";
    const user2Info = c.user2?.fullName || c.user2?.email || c.user2Id || "";
    const matchesSearch =
      user1Info.toLowerCase().includes(search.toLowerCase()) ||
      user2Info.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: conversations.length,
    active: conversations.filter((c) => c.status === "active").length,
    ended: conversations.filter((c) => c.status === "ended").length,
    blocked: conversations.filter((c) => c.status === "blocked").length,
  };

  const statusConfig = {
    active: { label: "Đang hoạt động", color: "green" as const },
    ended: { label: "Đã kết thúc", color: "gray" as const },
    blocked: { label: "Đã chặn", color: "red" as const },
  };

  return (
    <Flex direction="column" gap="5">
      {/* Header */}
      <Flex justify="between" align="center">
        <Heading size="6">Quản lý tin nhắn</Heading>
        <Flex align="center" gap="2">
          <Text size="2" color="gray">
            Tổng: {filtered.length} cuộc trò chuyện
          </Text>
          <Button variant="ghost" size="1" onClick={fetchConversations}>
            <ReloadIcon width={16} height={16} />
          </Button>
        </Flex>
      </Flex>

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {/* Stats Cards */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        <Card size="1" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">Tổng cộng</Text>
            <Heading size="5">{stats.total}</Heading>
          </Flex>
        </Card>
        <Card size="1" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">Đang hoạt động</Text>
            <Heading size="5" color="green">{stats.active}</Heading>
          </Flex>
        </Card>
        <Card size="1" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">Đã kết thúc</Text>
            <Heading size="5" color="gray">{stats.ended}</Heading>
          </Flex>
        </Card>
        <Card size="1" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">Đã chặn</Text>
            <Heading size="5" color="red">{stats.blocked}</Heading>
          </Flex>
        </Card>
      </Box>

      {/* Search & Filter */}
      <Card size="2">
        <Flex gap="3" align="center" wrap="wrap">
          <TextField.Root
            placeholder="Tìm kiếm theo ID hoặc tên người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 280 }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon width={16} height={16} color="var(--gray-9)" />
            </TextField.Slot>
          </TextField.Root>
          <Flex gap="2">
            <Button
              variant={statusFilter === "all" ? "solid" : "soft"}
              size="2"
              onClick={() => setStatusFilter("all")}
            >
              Tất cả
            </Button>
            <Button
              variant={statusFilter === "active" ? "solid" : "soft"}
              color="green"
              size="2"
              onClick={() => setStatusFilter("active")}
            >
              Hoạt động
            </Button>
            <Button
              variant={statusFilter === "ended" ? "solid" : "soft"}
              color="gray"
              size="2"
              onClick={() => setStatusFilter("ended")}
            >
              Đã kết thúc
            </Button>
            <Button
              variant={statusFilter === "blocked" ? "solid" : "soft"}
              color="red"
              size="2"
              onClick={() => setStatusFilter("blocked")}
            >
              Đã chặn
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Conversations Table */}
      <Card size="2">
        <Box style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gray-4)" }}>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Người dùng</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Cuộc trò chuyện</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Trạng thái</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Cập nhật</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Hành động</Text>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((chat) => (
                <tr
                  key={chat.id}
                  style={{ borderBottom: "1px solid var(--gray-3)", cursor: "pointer" }}
                  onClick={() => setSelectedChat(chat)}
                  onMouseOver={(e) => e.currentTarget.style.background = "var(--gray-2)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <Flex gap="2" align="center">
                      <Flex align="center" gap="0">
                        <Avatar
                          size="1"
                          radius="full"
                          src={chat.user1?.avatarUrl || undefined}
                          fallback={getInitials(chat.user1?.fullName, chat.user1Id)}
                          color="indigo"
                        />
                        <Avatar
                          size="1"
                          radius="full"
                          src={chat.user2?.avatarUrl || undefined}
                          fallback={getInitials(chat.user2?.fullName, chat.user2Id)}
                          color="crimson"
                          style={{ marginLeft: -8 }}
                        />
                      </Flex>
                      <div>
                        <Text size="2" weight="medium">
                          {chat.user1?.fullName || chat.user1?.email || chat.user1Id}
                        </Text>
                      </div>
                    </Flex>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Text size="2" color="gray">
                      ↔ {chat.user2?.fullName || chat.user2?.email || chat.user2Id}
                    </Text>
                    <Text size="1" color="gray" style={{ display: "block" }}>ID: {chat.id.slice(0, 8)}</Text>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge color={statusConfig[chat.status].color} variant="soft" size="1">
                      {statusConfig[chat.status].label}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Text size="2" color="gray">{formatTimeAgo(chat.updatedAt)}</Text>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Flex gap="1">
                      <Button variant="ghost" size="1" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChat(chat);
                      }}>
                        <EyeOpenIcon width={14} height={14} />
                      </Button>
                      {chat.status !== "blocked" && (
                        <Button variant="ghost" size="1" color="red" onClick={(e) => e.stopPropagation()}>
                          <LockClosedIcon width={14} height={14} />
                        </Button>
                      )}
                    </Flex>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <Flex justify="center" align="center" p="8" direction="column" gap="2">
              <ChatBubbleIcon width={48} height={48} color="var(--gray-6)" />
              <Text size="3" color="gray">Không tìm thấy cuộc trò chuyện nào</Text>
            </Flex>
          )}
        </Box>
      </Card>

      {/* Detail Dialog */}
      <ChatDetailDialog chat={selectedChat} onClose={() => setSelectedChat(null)} />
    </Flex>
  );
}