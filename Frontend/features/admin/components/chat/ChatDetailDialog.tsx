import { Box, Button, Dialog, Flex, Separator, Spinner, Text } from "@radix-ui/themes";
import { useEffect, useMemo, useState } from "react";
import type { AdminConversation } from "@/features/athu";
import { ChatStatusBadge } from "./ChatStatusBadge";
import { UserAvatar } from "./UserAvatar";
import { formatChatDate, getChatUserName } from "./chatUtils";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";
import chatStyles from "./admin-chat.module.css";

type ChatMessage = {
  content: string;
  conversationId: string;
  createdAt: string;
  id: string;
  sender?: {
    email: string;
    fullName: string | null;
    id: string;
  };
  senderId: string;
  status: string;
};

export function ChatDetailDialog({
  chat,
  onClose,
}: {
  chat: AdminConversation | null;
  onClose: () => void;
}) {
  const s = useAdminStyles();
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!chat) {
      queueMicrotask(() => {
        setMessages([]);
        setMessageError(null);
      });
      return;
    }

    const controller = new AbortController();

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setMessageError(null);

      try {
        const response = await fetch(`/api/v1/manager/chats/${chat.id}/messages?limit=100`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Không thể tải lịch sử tin nhắn");
        }

        const data: unknown = await response.json();
        const items = Array.isArray(data)
          ? data
          : data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)
            ? (data as { items: unknown[] }).items
            : [];
        setMessages((items as ChatMessage[]).reverse());
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
      [chat.user1Id, getChatUserName(chat.user1, chat.user1Id)],
      [chat.user2Id, getChatUserName(chat.user2, chat.user2Id)],
    ]);
  }, [chat]);

  if (!chat) return null;

  return (
    <Dialog.Root onOpenChange={(open) => !open && onClose()} open={Boolean(chat)}>
      <Dialog.Content className={s.chat.detailContent}>
        <Dialog.Title>Chi tiết cuộc trò chuyện</Dialog.Title>
        <Dialog.Description size="2">Thông tin và lịch sử tin nhắn gần nhất.</Dialog.Description>

        <Flex direction="column" gap="4" mt="4">
          <Flex align="center" direction="column" gap="3" py="3">
            <Flex align="center" gap="2">
              <UserAvatar size="3" user={chat.user1} />
              <Text size="2" className={s.chat.chatInfoLabel}>
                với
              </Text>
              <UserAvatar size="3" user={chat.user2} />
            </Flex>
            <ChatStatusBadge status={chat.status} />
          </Flex>

          <Separator />

          <Box className={s.chat.detailGrid}>
            <DetailItem label="Người dùng 1" value={getChatUserName(chat.user1, chat.user1Id)} />
            <DetailItem label="Người dùng 2" value={getChatUserName(chat.user2, chat.user2Id)} />
            <DetailItem label="Bắt đầu" value={formatChatDate(chat.createdAt)} />
            <DetailItem label="Cập nhật cuối" value={formatChatDate(chat.updatedAt)} />
          </Box>

          <Box className={s.chat.detailIdBox}>
            <Text as="div" size="1" className={s.chat.detailIdLabel}>
              ID cuộc trò chuyện
            </Text>
            <Text as="div" size="2" className={s.chat.detailIdValue}>
              {chat.id}
            </Text>
          </Box>

          <Separator />

          <Flex direction="column" gap="3">
            <Flex align="center" justify="between">
              <Text size="3" weight="bold" className={s.chat.listTitle}>
                Giám sát nội dung trò chuyện
              </Text>
              <Text size="1" className={s.chat.chatInfoLabel}>
                {messages.length} tin nhắn gần nhất
              </Text>
            </Flex>

            <Box className={s.chat.messagesSection}>
              {loadingMessages ? (
                <Flex align="center" gap="2">
                  <Spinner size="1" />
                  <Text size="2" className={s.chat.loadingText}>
                    Đang tải lịch sử tin nhắn...
                  </Text>
                </Flex>
              ) : messageError ? (
                <Text size="2" color="red">
                  {messageError}
                </Text>
              ) : messages.length === 0 ? (
                <Text size="2" className={s.chat.loadingText}>
                  Cuộc trò chuyện chưa có tin nhắn.
                </Text>
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
                        <Flex align="center" gap="3" justify="between">
                          <Text size="2" weight="bold" className={s.chat.messageSender}>
                            {senderName}
                          </Text>
                          <Text size="1" className={s.chat.messageTime}>
                            {formatChatDate(message.createdAt)}
                          </Text>
                        </Flex>
                        <Text size="2" className={s.chat.messageContent}>
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

        <Flex justify="end" mt="5">
          <Dialog.Close>
            <Button variant="soft">Đóng</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Flex direction="column" gap="1">
      <Text size="1" className={chatStyles.chatInfoLabel}>
        {label}
      </Text>
      <Text size="2" weight="medium" className={chatStyles.chatInfoValue}>
        {value}
      </Text>
    </Flex>
  );
}
