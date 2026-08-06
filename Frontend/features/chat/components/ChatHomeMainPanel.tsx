"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import { ChatArea } from "./ChatArea";
import { MatchPeople } from "./MatchPeople";
import type { CenterMode, MatchedUser } from "../types";

type ChatHomeMainPanelProps = {
  conversationId: string | null;
  matchedUser: MatchedUser | null;
  mode: CenterMode;
  onBack: () => void;
  onSearch: () => void;
  onSelectConversation: (convId: string, partner: MatchedUser) => void;
  selectedUser: string | null;
};

export function ChatHomeMainPanel({
  conversationId,
  matchedUser,
  mode,
  onBack,
  onSearch,
  onSelectConversation,
  selectedUser,
}: ChatHomeMainPanelProps) {
  // Đang trong cuộc trò chuyện
  if (mode === "chat" && selectedUser && conversationId) {
    return (
      <Box
        className="chat-main-panel chat-main-panel-active"
        style={{
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          position: "relative",
          width: "100%",
        }}
      >
        <ChatArea
          selectedUser={selectedUser}
          matchedUser={matchedUser}
          conversationId={conversationId}
          onBack={onBack}
        />
      </Box>
    );
  }

  // Đang tìm người lạ - tự động bắt đầu tìm
  if (mode === "match") {
    return (
      <Box
        className="chat-main-panel"
        style={{
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          position: "relative",
          width: "100%",
          background: "var(--chat-bg)",
        }}
      >
        <MatchPeople
          onCancel={onBack}
          onMatched={onSelectConversation}
          autoStart
        />
      </Box>
    );
  }

  // Trang chủ - hiện nút tìm kiếm lớn ở giữa
  return (
    <Box
      className="chat-main-panel"
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        minHeight: 0,
        minWidth: 0,
        position: "relative",
        width: "100%",
        background: "var(--chat-bg)",
      }}
    >
      <button
        type="button"
        onClick={onSearch}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "48px 40px",
          borderRadius: 24,
          border: "2px dashed var(--chat-border)",
          background: "transparent",
          cursor: "pointer",
          transition: "all 0.2s ease",
          maxWidth: 300,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--primary)";
          e.currentTarget.style.background = "rgba(93, 45, 230, 0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--chat-border)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <Box
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </Box>
        <Flex direction="column" gap="1" align="center">
          <Text size="4" weight="bold" style={{ color: "var(--text-primary)" }}>
            Tìm người lạ
          </Text>
          <Text size="2" style={{ color: "var(--text-secondary)" }}>
            Bấm để bắt đầu trò chuyện
          </Text>
        </Flex>
      </button>
    </Box>
  );
}
