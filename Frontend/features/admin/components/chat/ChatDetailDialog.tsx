import { Box, Button, Dialog, Flex, Separator, Text } from "@radix-ui/themes";
import type { Conversation } from "@/features/athu";
import { StatusBadge } from "./StatusBadge";
import { UserAvatar } from "./UserAvatar";
import { useEffect, useMemo, useState } from "react";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ChatDetailDialogProps {
  chat: Conversation | null;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: string;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string | null;
    email: string;
  };
}

export function ChatDetailDialog({ chat, onClose }: ChatDetailDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  useEffect(() => {
    if (!chat) {
      setMessages([]);
      setMessageError(null);
      return;
    }

    const controller = new AbortController();

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setMessageError(null);

      try {
        const response = await fetch(`/api/admin/chats/${chat.id}/messages?limit=100`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Không thể tải lịch sử tin nhắn");
        }

        const data = await response.json();
        setMessages(Array.isArray(data) ? data.reverse() : []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setMessageError(error instanceof Error ? error.message : "Không thể tải lịch sử tin nhắn");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingMessages(false);
        }
      }
    };

    void fetchMessages();

    return () => controller.abort();
  }, [chat]);

  const userNameById = useMemo(() => {
    if (!chat) return new Map<string, string>();

    return new Map([
      [chat.user1Id, chat.user1?.fullName || chat.user1?.email || chat.user1Id],
      [chat.user2Id, chat.user2?.fullName || chat.user2?.email || chat.user2Id],
    ]);
  }, [chat]);

  if (!chat) return null;

  return (
    <Dialog.Root open={!!chat} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content style={{ maxWidth: 760 }}>
        <Dialog.Title>Chi tiết cuộc trò chuyện</Dialog.Title>
        <Dialog.Description size="2">
          Thông tin chi tiết về cuộc trò chuyện
        </Dialog.Description>

        <Flex direction="column" gap="4" mt="4">
          {/* Avatar section - Centered */}
          <Flex direction="column" align="center" gap="3" py="4">
            <Flex align="center" gap="2">
              <UserAvatar user={chat.user1} size="3" />
              <Text size="2" color="gray">↔</Text>
              <UserAvatar user={chat.user2} size="3" />
            </Flex>
            <StatusBadge status={chat.status} />
          </Flex>

          <Separator />

          {/* Info Grid */}
          <Box style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}>
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">Người dùng 1</Text>
              <Text size="2" weight="medium">
                {chat.user1?.fullName || chat.user1?.email || chat.user1Id}
              </Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">Người dùng 2</Text>
              <Text size="2" weight="medium">
                {chat.user2?.fullName || chat.user2?.email || chat.user2Id}
              </Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">Bắt đầu</Text>
              <Text size="2" weight="medium">{formatDate(chat.createdAt)}</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">Cập nhật lần cuối</Text>
              <Text size="2" weight="medium">{formatDate(chat.updatedAt)}</Text>
            </Flex>
          </Box>

          {/* Full ID - Centered */}
          <Flex direction="column" align="center" gap="1" py="2">
            <Text size="2" color="gray">ID cuộc trò chuyện</Text>
            <Text size="2" weight="medium" style={{
              backgroundColor: "var(--gray-2)",
              padding: "8px 16px",
              borderRadius: 6,
              fontFamily: "monospace",
            }}>
              {chat.id}
            </Text>
          </Flex>

          <Separator />

          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Text size="3" weight="bold">Giám sát nội dung chat</Text>
              <Text size="1" color="gray">{messages.length} tin nhắn gần nhất</Text>
            </Flex>

            <Box
              style={{
                maxHeight: 320,
                overflowY: "auto",
                background: "var(--gray-2)",
                padding: 12,
              }}
            >
              {loadingMessages ? (
                <Text size="2" color="gray">Đang tải lịch sử tin nhắn...</Text>
              ) : messageError ? (
                <Text size="2" color="red">{messageError}</Text>
              ) : messages.length === 0 ? (
                <Text size="2" color="gray">Cuộc trò chuyện chưa có tin nhắn.</Text>
              ) : (
                <Flex direction="column" gap="3">
                  {messages.map((message) => {
                    const senderName =
                      message.sender?.fullName ||
                      message.sender?.email ||
                      userNameById.get(message.senderId) ||
                      message.senderId;

                    return (
                      <Flex key={message.id} direction="column" gap="1">
                        <Flex justify="between" gap="3" align="center">
                          <Text size="2" weight="medium">{senderName}</Text>
                          <Text size="1" color="gray">{formatDate(message.createdAt)}</Text>
                        </Flex>
                        <Text
                          size="2"
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            lineHeight: 1.5,
                          }}
                        >
                          {message.content}
                        </Text>
                      </Flex>
                    );
                  })}
                </Flex>
              )}
            </Box>
          </Flex>
        </Flex>

        <Flex justify="end" gap="2" mt="5">
          <Dialog.Close>
            <Button variant="soft">Đóng</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
