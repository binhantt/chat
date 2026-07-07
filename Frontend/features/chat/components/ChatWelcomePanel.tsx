import { Box, Flex, Text } from "@radix-ui/themes";
import { ChatBubbleIcon } from "@radix-ui/react-icons";

type ChatWelcomePanelProps = {
  onMatch: () => void;
  onSearch: () => void;
};

export function ChatWelcomePanel({ onMatch, onSearch }: ChatWelcomePanelProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={{ initial: "4", md: "6" }}
      style={{
        flex: 1,
        padding: "32px 24px",
        textAlign: "center",
      }}
    >
      {/* Step 1: Big icon / visual */}
      <Box
        style={{
          background: "var(--chat-accent-soft)",
          borderRadius: "50%",
          height: 80,
          width: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChatBubbleIcon width={36} height={36} color="var(--chat-accent)" />
      </Box>

      {/* Step 2: Big title */}
      <Flex direction="column" gap="2" align="center">
        <Text
          size={{ initial: "7", md: "8" }}
          weight="bold"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--text-primary)",
            lineHeight: 1.15,
          }}
        >
          Chào mừng trở lại
        </Text>
        <Text
          size={{ initial: "5", md: "6" }}
          weight="bold"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--chat-accent)",
            lineHeight: 1.15,
          }}
        >
          Người Lạ
        </Text>
      </Flex>

      {/* Step 3: Description */}
      <Text
        size={{ initial: "2", md: "3" }}
        style={{
          color: "var(--chat-muted)",
          fontFamily: "var(--font-body)",
          lineHeight: 1.7,
          maxWidth: 460,
        }}
      >
        Tìm lại hội thoại cũ hoặc bắt đầu ghép đôi mới trong không gian trò chuyện
        gọn gàng, riêng tư và đồng bộ với hồ sơ của bạn.
      </Text>

      {/* Step 4: CTA buttons */}
      <Flex gap="3" wrap="wrap" justify="center">
        <button
          type="button"
          className="chat-primary-button"
          onClick={onMatch}
          style={{
            background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
            color: "#FFFFFF",
            height: 44,
            padding: "0 24px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(168, 85, 247, 0.25)",
          }}
        >
          Tìm kiếm người
        </button>
        <button
          type="button"
          className="chat-secondary-button"
          onClick={onSearch}
          style={{
            height: 44,
            padding: "0 24px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Xem hội thoại
        </button>
      </Flex>
    </Flex>
  );
}
