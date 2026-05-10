import { Box, Button, Dialog, Flex, Separator, Text } from "@radix-ui/themes";
import type { Conversation } from "@/features/athu";
import { StatusBadge } from "./StatusBadge";
import { UserAvatar } from "./UserAvatar";

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

export function ChatDetailDialog({ chat, onClose }: ChatDetailDialogProps) {
  if (!chat) return null;

  return (
    <Dialog.Root open={!!chat} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content style={{ maxWidth: 520 }}>
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