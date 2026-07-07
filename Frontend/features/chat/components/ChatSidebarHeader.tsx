import { Box, Flex, Text } from "@radix-ui/themes";
import { ChatBubbleIcon } from "@radix-ui/react-icons";

type ChatSidebarHeaderProps = {
  onHome: () => void;
};

export function ChatSidebarHeader({ onHome }: ChatSidebarHeaderProps) {
  return (
    <Flex align="center" gap="3" style={{ minWidth: 0 }}>
      <button
        type="button"
        className="chat-brand-button"
        onClick={onHome}
        title="Trang trò chuyện chính"
        aria-label="Trang trò chuyện chính"
      >
        <ChatBubbleIcon height={18} width={18} />
      </button>
      <Box style={{ minWidth: 0 }}>
        <Text as="div" size="3" weight="bold" style={{ color: "var(--text-primary)" }}>
          Phòng trò chuyện
        </Text>
        <Text as="div" size="1" className="chat-muted">
          Trò chuyện và ghép đôi
        </Text>
      </Box>
    </Flex>
  );
}
