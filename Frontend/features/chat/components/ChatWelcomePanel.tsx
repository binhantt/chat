import { Box, Flex, Text } from "@radix-ui/themes";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";

type ChatWelcomePanelProps = {
  onMatch: () => void;
  onSearch: () => void;
};

export function ChatWelcomePanel({ onMatch, onSearch }: ChatWelcomePanelProps) {
  return (
    <Box
      className="chat-empty-state"
      style={{
        background:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(239, 246, 255, 0.52))",
        borderRadius: 8,
        flex: 1,
      }}
    >
      <Box
        className="chat-empty-icon"
        style={{
          background: `linear-gradient(135deg, ${authTheme.control}, ${authTheme.cyan})`,
          color: "#FFFFFF",
        }}
      >
        <ChatBubbleIcon width="26" height="26" />
      </Box>
      <Flex direction="column" gap="2" align="center">
        <Text size="7" weight="bold" style={{ color: authTheme.text }}>
          Chào mừng trở lại Người Lạ
        </Text>
        <Text
          size="3"
          className="chat-muted"
          style={{ lineHeight: 1.7, maxWidth: 460 }}
        >
          Tìm lại hội thoại cũ hoặc bắt đầu ghép đôi mới trong không gian trò chuyện
          gọn gàng, riêng tư và đồng bộ với hồ sơ của bạn.
        </Text>
      </Flex>
      <Flex gap="3" wrap="wrap" justify="center">
        <button
          type="button"
          className="chat-primary-button"
          onClick={onMatch}
          style={{
            background: `linear-gradient(135deg, ${authTheme.control}, ${authTheme.cyan})`,
            color: "#FFFFFF",
            height: 42,
            padding: "0 18px",
          }}
        >
          Tìm kiếm người
        </button>
        <button
          type="button"
          className="chat-secondary-button"
          onClick={onSearch}
          style={{ height: 42, padding: "0 18px" }}
        >
          Xem hội thoại
        </button>
      </Flex>
    </Box>
  );
}
