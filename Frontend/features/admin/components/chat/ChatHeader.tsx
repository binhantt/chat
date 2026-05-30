import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { ChatBubbleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";

export function ChatHeader({
  count,
  onRefresh,
}: {
  count: number;
  onRefresh: () => void;
}) {
  return (
    <Flex
      align={{ initial: "start", md: "center" }}
      direction={{ initial: "column", md: "row" }}
      gap="3"
      justify="between"
      style={{
        background:
          "linear-gradient(90deg, rgba(59,130,246,0.12), rgba(255,255,255,0.92))",
        borderRadius: 8,
        padding: 18,
      }}
    >
      <Flex align="center" gap="3">
        <Flex
          align="center"
          justify="center"
          style={{
            background: authTheme.control,
            borderRadius: 8,
            color: "#FFFFFF",
            height: 48,
            width: 48,
          }}
        >
          <ChatBubbleIcon height={22} width={22} />
        </Flex>
        <Box>
          <Heading size="6" style={{ color: authTheme.text, letterSpacing: 0 }}>
            Quản lý tin nhắn
          </Heading>
          <Text
            as="p"
            size="2"
            style={{
              color: authTheme.muted,
              lineHeight: 1.55,
              margin: "4px 0 0",
              maxWidth: 720,
            }}
          >
            Tổng {count} cuộc trò chuyện. Theo dõi trạng thái, kiểm tra người
            tham gia và xem lịch sử tin nhắn khi cần xử lý.
          </Text>
        </Box>
      </Flex>
      <Button
        onClick={onRefresh}
        size="2"
        variant="solid"
        style={{ borderRadius: 8 }}
      >
        <ReloadIcon />
        Làm mới
      </Button>
    </Flex>
  );
}
