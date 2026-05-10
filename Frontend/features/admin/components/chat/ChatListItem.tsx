import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { EyeOpenIcon, LockClosedIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import type { Conversation } from "@/features/athu";
import { StatusBadge } from "./StatusBadge";
import { UserAvatar } from "./UserAvatar";

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

interface ChatListItemProps {
  chat: Conversation;
  onView: (chat: Conversation) => void;
  onToggleBlock: (chat: Conversation) => void;
}

export function ChatListItem({ chat, onView, onToggleBlock }: ChatListItemProps) {
  const isBlocked = chat.status === "blocked";

  return (
    <Box
      style={{
        padding: 16,
        borderRadius: 8,
        border: "1px solid var(--gray-4)",
        backgroundColor: "var(--gray-1)",
        transition: "all 0.2s",
      }}
    >
      <Flex justify="between" align="center" gap="6" wrap="wrap">
        {/* Left side - Users */}
        <Flex align="center" gap="4" style={{ flex: 1, minWidth: 280 }}>
          <Flex align="center" gap="2">
            <UserAvatar user={chat.user1} />
            <UserAvatar user={chat.user2} />
          </Flex>
          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">
              {chat.user1?.fullName || chat.user1?.email || chat.user1Id}
            </Text>
            <Text size="1" color="gray">
              {chat.user2?.fullName || chat.user2?.email || chat.user2Id}
            </Text>
          </Flex>
        </Flex>

        {/* Middle - Status & Time */}
        <Flex align="center" gap="5">
          <StatusBadge status={chat.status} />
          <Flex direction="column" gap="0" align="end">
            <Text size="1" color="gray">
              {formatTimeAgo(chat.updatedAt)}
            </Text>
            <Text size="1" color="gray" style={{ fontSize: 10 }}>
              #{chat.id.slice(0, 8)}
            </Text>
          </Flex>
        </Flex>

        {/* Right side - Actions */}
        <Flex gap="1" align="center">
          <Button
            variant="ghost"
            size="1"
            onClick={() => onView(chat)}
          >
            <EyeOpenIcon width={14} height={14} />
          </Button>
          <Button
            variant="ghost"
            size="1"
            color={isBlocked ? "green" : "red"}
            onClick={() => onToggleBlock(chat)}
          >
            {isBlocked ? (
              <LockOpen1Icon width={14} height={14} />
            ) : (
              <LockClosedIcon width={14} height={14} />
            )}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}