import { Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";
import { SearchPeople } from "./SearchPeople";
import type { MatchedUser } from "../types";

type ChatConversationSectionProps = {
  conversationId: string | null;
  onSelectConversation: (convId: string, partner: MatchedUser) => void;
};

export function ChatConversationSection({
  conversationId,
  onSelectConversation,
}: ChatConversationSectionProps) {
  return (
    <Flex direction="column" gap="2" style={{ minHeight: 0 }}>
      <Flex align="center" justify="between">
        <Text size="2" weight="bold" style={{ color: authTheme.text }}>
          Hoi thoai
        </Text>
        <Text size="1" className="chat-muted">
          Gan day
        </Text>
      </Flex>
      <SearchPeople
        selectedConversationId={conversationId}
        onSelectConversation={onSelectConversation}
      />
    </Flex>
  );
}
