import { Flex } from "@radix-ui/themes";
import { ChatPanelFrame } from "./ChatPanelFrame";
import { ChatConversationSection } from "./ChatConversationSection";
import { ChatSidebarActions } from "./ChatSidebarActions";
import { ChatSidebarHeader } from "./ChatSidebarHeader";
import type { CenterMode, MatchedUser } from "../types";

type ChatHomeSidebarProps = {
  conversationId: string | null;
  mode: CenterMode;
  onHome: () => void;
  onMatch: () => void;
  onSearch: () => void;
  onSelectConversation: (convId: string, partner: MatchedUser) => void;
};

export function ChatHomeSidebar({
  conversationId,
  mode,
  onHome,
  onMatch,
  onSearch,
  onSelectConversation,
}: ChatHomeSidebarProps) {
  return (
    <ChatPanelFrame
      bodyPadding={12}
      className="chat-sidebar-panel"
      title={<ChatSidebarHeader onHome={onHome} />}
    >
      <Flex direction="column" gap="4" style={{ minHeight: 0 }}>
        <ChatSidebarActions
          mode={mode}
          onMatch={onMatch}
          onSearch={onSearch}
        />
        <ChatConversationSection
          conversationId={conversationId}
          onSelectConversation={onSelectConversation}
        />
      </Flex>
    </ChatPanelFrame>
  );
}
