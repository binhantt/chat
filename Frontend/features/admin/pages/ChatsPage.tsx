"use client";

import {
  Flex,
  Text,
  Box,
  Card,
  Heading,
  TextField,
  Button,
  Badge,
  Avatar,
  Callout,
  Spinner,
  Dialog,
} from "@radix-ui/themes";
import {
  ChatBubbleIcon,
  MagnifyingGlassIcon,
  DotsHorizontalIcon,
  TrashIcon,
  ReloadIcon,
  LockClosedIcon,
  LockOpen1Icon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import { useState, useEffect, useCallback } from "react";
import { getConversations, type Conversation } from "@/features/athu";

function StatusBadge({ status }: { status: Conversation["status"] }) {
  const config = {
    active: { label: "Đang hoạt động", color: "green" },
    ended: { label: "Đã kết thúc", color: "gray" },
    blocked: { label: "Đã chặn", color: "red" },
  };
  const { label, color } = config[status];
  return (
    <Badge color={color as any} variant="soft">
      {label}
    </Badge>
  );
}

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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

  return (
    <Flex direction="column" gap="5">
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

      {/* Stats */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <Card size="1" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">Tổng cuộc trò chuyện</Text>
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

      {/* Search and Filter */}
      <Card size="2">
        <Flex gap="3" align="center" wrap="wrap">
          <TextField.Root
            placeholder="Tìm kiếm theo ID hoặc người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 280 }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon width={16} height={16} color="var(--gray-9)" />
            </TextField.Slot>
          </TextField.Root>
          <Flex gap="2">
            <Button variant={statusFilter === "all" ? "solid" : "soft"} size="2" onClick={() => setStatusFilter("all")}>
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
                  <Text size="2" color="gray" weight="medium">ID</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Người tham gia</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Trạng thái</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Bắt đầu</Text>
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
                <tr key={chat.id} style={{ borderBottom: "1px solid var(--gray-3)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <Text size="2" color="gray">#{chat.id.slice(0, 8)}</Text>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Flex gap="1" align="center">
                      <Avatar
                        size="1"
                        radius="full"
                        src={chat.user1?.avatarUrl || undefined}
                        fallback={(chat.user1?.fullName || chat.user1Id || "??").slice(0, 2).toUpperCase()}
                        color="indigo"
                      />
                      <Text size="2" weight="medium">
                        2 người
                      </Text>
                    </Flex>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge status={chat.status} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Text size="2" color="gray">{formatTimeAgo(chat.createdAt)}</Text>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Text size="2" color="gray">{formatTimeAgo(chat.updatedAt)}</Text>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Flex gap="1" align="center">
                      <Button variant="ghost" size="1" onClick={() => setSelectedChat(chat)}>
                        <EyeOpenIcon width={14} height={14} />
                      </Button>
                      {chat.status !== "blocked" && (
                        <Button variant="ghost" size="1" color="red">
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
              <Text size="2" color="gray">Thử thay đổi điều kiện tìm kiếm</Text>
            </Flex>
          )}
        </Box>
      </Card>

      {/* Detail Dialog */}
      <Dialog.Root open={!!selectedChat} onOpenChange={(open) => !open && setSelectedChat(null)}>
        <Dialog.Content style={{ maxWidth: 480 }}>
          <Dialog.Title>Chi tiết cuộc trò chuyện</Dialog.Title>
          <Dialog.Description size="2">
            Thông tin chi tiết về cuộc trò chuyện
          </Dialog.Description>

          {selectedChat && (
            <Flex direction="column" gap="3" mt="4">
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">ID</Text>
                <Text size="2" weight="medium">{selectedChat.id}</Text>
              </Flex>
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">Người tham gia</Text>
                <Text size="2" weight="medium">
                  {selectedChat.user1?.fullName || selectedChat.user1?.email || selectedChat.user1Id} —{" "}
                  {selectedChat.user2?.fullName || selectedChat.user2?.email || selectedChat.user2Id}
                </Text>
              </Flex>
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">Trạng thái</Text>
                <StatusBadge status={selectedChat.status} />
              </Flex>
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">Bắt đầu</Text>
                <Text size="2" weight="medium">{formatDate(selectedChat.createdAt)}</Text>
              </Flex>
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">Cập nhật lần cuối</Text>
                <Text size="2" weight="medium">{formatDate(selectedChat.updatedAt)}</Text>
              </Flex>
            </Flex>
          )}

          <Flex justify="end" gap="2" mt="5">
            <Dialog.Close>
              <Button variant="soft">Đóng</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
}