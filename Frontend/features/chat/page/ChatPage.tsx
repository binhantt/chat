"use client";

import { Box } from "@radix-ui/themes";
import { ChatHomeMainPanel } from "../components/ChatHomeMainPanel";
import { useChatHome } from "../hooks/useChatHome";
import { chatShellStyle } from "../styles/chatHomeTheme";

export function ChatPage() {
  const chat = useChatHome();

  return (
    <Box className="chat-shell chat-single-shell" style={chatShellStyle}>
      <ChatHomeMainPanel
        conversationId={chat.conversationId}
        matchedUser={chat.matchedUser}
        mode={chat.mode}
        onBack={chat.handleChatBack}
        onCancelMatch={chat.handleCancelMatch}
        onHome={chat.handleHomeClick}
        onMatched={chat.handleMatched}
        selectedUser={chat.selectedUser}
      />
    </Box>
  );
}
