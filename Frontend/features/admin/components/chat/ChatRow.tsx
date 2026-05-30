import { Avatar, Box, Button, Flex, Text } from "@radix-ui/themes";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import type { AdminConversation } from "@/features/athu";
import { authTheme } from "@/features/athu/styles/authTheme";
import { chatInnerBorder } from "@/features/admin/styles/chatTheme";
import { ChatStatusBadge } from "./ChatStatusBadge";
import { formatChatTimeAgo, getChatInitials, getChatUserName } from "./chatUtils";

export function ChatRow({
  chat,
  onView,
}: {
  chat: AdminConversation;
  onView: (chat: AdminConversation) => void;
}) {
  const user1Name = getChatUserName(chat.user1, chat.user1Id);
  const user2Name = getChatUserName(chat.user2, chat.user2Id);

  return (
    <Flex
      align={{ initial: "start", lg: "center" }}
      direction={{ initial: "column", lg: "row" }}
      gap="3"
      onClick={() => onView(chat)}
      style={{
        background: "#FFFFFF",
        border: chatInnerBorder,
        borderRadius: 8,
        cursor: "pointer",
        padding: 14,
      }}
    >
      <Flex align="center" gap="3" style={{ flex: "1.4 1 0", minWidth: 250 }}>
        <Flex align="center">
          <Avatar
            fallback={getChatInitials(chat.user1?.fullName, chat.user1Id)}
            radius="full"
            size="3"
            src={chat.user1?.avatarUrl || undefined}
          />
          <Avatar
            fallback={getChatInitials(chat.user2?.fullName, chat.user2Id)}
            radius="full"
            size="3"
            src={chat.user2?.avatarUrl || undefined}
            style={{ marginLeft: -10 }}
          />
        </Flex>
        <Box style={{ minWidth: 0 }}>
          <Text as="div" size="3" weight="bold" style={{ color: authTheme.text }}>
            {user1Name}
          </Text>
          <Text as="div" size="2" style={{ color: authTheme.muted, overflowWrap: "anywhere" }}>
            với {user2Name}
          </Text>
        </Box>
      </Flex>

      <InfoBlock label="Mã trò chuyện" value={`#${chat.id.slice(0, 8)}`} />
      <Flex align="center" style={{ flex: "0.6 1 0", minWidth: 120 }}>
        <ChatStatusBadge status={chat.status} />
      </Flex>
      <InfoBlock label="Cập nhật" value={formatChatTimeAgo(chat.updatedAt)} />

      <Flex justify={{ initial: "start", lg: "end" }} style={{ minWidth: 84 }}>
        <Button
          onClick={(event) => {
            event.stopPropagation();
            onView(chat);
          }}
          size="2"
          variant="soft"
          style={{ borderRadius: 8 }}
        >
          <EyeOpenIcon />
          Xem
        </Button>
      </Flex>
    </Flex>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <Box style={{ flex: "0.75 1 0", minWidth: 130 }}>
      <Text as="div" size="1" style={{ color: authTheme.muted }}>
        {label}
      </Text>
      <Text as="div" size="2" style={{ color: authTheme.text, overflowWrap: "anywhere" }}>
        {value}
      </Text>
    </Box>
  );
}
