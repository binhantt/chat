import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { ChatBubbleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function ChatHeader({
  count,
  onRefresh,
}: {
  count: number;
  onRefresh: () => void;
}) {
  const s = useAdminStyles();
  return (
    <Flex
      align={{ initial: "start", md: "center" }}
      direction={{ initial: "column", md: "row" }}
      gap="3"
      justify="between"
      className={s.chat.headerCard}
    >
      <Flex align="center" gap="3">
        <Flex align="center" justify="center" className={s.chat.headerIcon}>
          <ChatBubbleIcon height={22} width={22} />
        </Flex>
        <Box>
          <Heading size="6" className={s.chat.headerTitle}>
            Quản lý tin nhắn
          </Heading>
          <Text as="p" size="2" className={s.chat.headerDesc}>
            Tổng {count} cuộc trò chuyện. Theo dõi trạng thái, kiểm tra người
            tham gia và xem lịch sử tin nhắn khi cần xử lý.
          </Text>
        </Box>
      </Flex>
      <Button onClick={onRefresh} size="2" variant="solid" className={s.chat.headerBtn}>
        <ReloadIcon />
        Làm mới
      </Button>
    </Flex>
  );
}
