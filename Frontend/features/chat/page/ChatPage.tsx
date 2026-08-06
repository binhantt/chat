"use client";

import { Box } from "@radix-ui/themes";
import { ChatHomeMainPanel } from "../components/ChatHomeMainPanel";
import { ChatHomeSidebar } from "../components/ChatHomeSidebar";
import { useChatHome } from "../hooks/useChatHome";
import { chatShellStyle } from "../styles/chatHomeTheme";

export function ChatPage() {
  const chat = useChatHome();

  const isChatMode = chat.mode === "chat";

  return (
    <Box
      className="chat-shell chat-shell-responsive"
      data-chat-active={isChatMode}
      style={chatShellStyle}
    >
      {/* Sidebar chỉ hiện trên desktop, ẩn trên mobile */}
      <div className="chat-sidebar-desktop">
        <ChatHomeSidebar
          conversationId={chat.conversationId}
          mode={chat.mode}
          onHome={chat.handleHomeClick}
          onSearch={chat.handleSearchClick}
          onSelectConversation={chat.handleSelectConversation}
        />
      </div>
      <ChatHomeMainPanel
        conversationId={chat.conversationId}
        matchedUser={chat.matchedUser}
        mode={chat.mode}
        onBack={chat.handleChatBack}
        onSearch={chat.handleSearchClick}
        onSelectConversation={chat.handleSelectConversation}
        selectedUser={chat.selectedUser}
      />
    </Box>
  );
}
