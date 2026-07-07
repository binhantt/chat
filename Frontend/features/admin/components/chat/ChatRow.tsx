import { Avatar, Box, Button, Flex, Text } from "@radix-ui/themes";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import type { AdminConversation } from "@/features/athu";
import { ChatStatusBadge } from "./ChatStatusBadge";
import { formatChatTimeAgo, getChatInitials, getChatUserName } from "./chatUtils";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function ChatRow({
  chat,
  onView,
}: {
  chat: AdminConversation;
  onView: (chat: AdminConversation) => void;
}) {
  const s = useAdminStyles();
  const user1Name = getChatUserName(chat.user1, chat.user1Id);
  const user2Name = getChatUserName(chat.user2, chat.user2Id);

  return (
    <Flex
      align={{ initial: "start", lg: "center" }}
      direction={{ initial: "column", lg: "row" }}
      gap="3"
      onClick={() => onView(chat)}
      className={s.chat.chatRow}
    >
      <Flex align="center" gap="3" className={s.chat.chatUserSection}>
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
            className={s.chat.chatUserAvatarOverlap}
          />
        </Flex>
        <Box className={s.chat.chatUserNames}>
          <Text as="div" size="3" weight="bold" className={s.chat.chatUserName}>
            {user1Name}
          </Text>
          <Text as="div" size="2" className={s.chat.chatUserWith}>
            với {user2Name}
          </Text>
        </Box>
      </Flex>

      <InfoBlock label="Mã trò chuyện" value={`#${chat.id.slice(0, 8)}`} />
      <Flex align="center" className={s.chat.chatStatusBlock}>
        <ChatStatusBadge status={chat.status} />
      </Flex>
      <InfoBlock label="Cập nhật" value={formatChatTimeAgo(chat.updatedAt)} />

      <Flex justify={{ initial: "start", lg: "end" }} className={s.chat.chatActionBlock}>
        <Button
          onClick={(event) => {
            event.stopPropagation();
            onView(chat);
          }}
          size="2"
          variant="soft"
          className={s.chat.chatViewBtn}
        >
          <EyeOpenIcon />
          Xem
        </Button>
      </Flex>
    </Flex>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  const s = useAdminStyles();
  return (
    <Box className={s.chat.chatInfoBlock}>
      <Text as="div" size="1" className={s.chat.chatInfoLabel}>
        {label}
      </Text>
      <Text as="div" size="2" className={s.chat.chatInfoValue}>
        {value}
      </Text>
    </Box>
  );
}
