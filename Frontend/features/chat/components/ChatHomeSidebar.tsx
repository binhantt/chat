import { Flex, Text } from "@radix-ui/themes";
import { ChatPanelFrame } from "./ChatPanelFrame";
import type { CenterMode } from "../types";

type ChatHomeSidebarProps = {
  conversationId: string | null;
  mode: CenterMode;
  onHome: () => void;
  onSearch: () => void;
  onSelectConversation: (convId: string, partner: any) => void;
};

export function ChatHomeSidebar({
  conversationId,
  mode,
  onHome,
  onSearch,
  onSelectConversation,
}: ChatHomeSidebarProps) {
  return (
    <ChatPanelFrame
      bodyPadding={12}
      className="chat-sidebar-panel"
      title={
        <Flex align="center" gap="2" style={{ padding: "4px 8px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <Text size="3" weight="bold" style={{ color: "var(--text-primary)" }}>
            Trò chuyện
          </Text>
        </Flex>
      }
    >
      <Flex direction="column" gap="3" style={{ minHeight: 0, flex: 1 }}>
        <button
          type="button"
          onClick={onSearch}
          disabled={mode === "match"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            padding: "14px 16px",
            borderRadius: 14,
            border: "none",
            background: mode === "match"
              ? "linear-gradient(135deg, var(--primary), var(--secondary))"
              : "var(--chat-surface-muted)",
            color: mode === "match" ? "#fff" : "var(--text-primary)",
            cursor: mode === "match" ? "default" : "pointer",
            fontSize: 15,
            fontWeight: 600,
            transition: "all 0.2s ease",
            boxShadow: mode === "match" ? "0 4px 16px rgba(93, 45, 230, 0.3)" : "none",
          }}
        >
          {mode === "match" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
          {mode === "match" ? "Đang tìm..." : "Tìm người lạ"}
        </button>
      </Flex>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </ChatPanelFrame>
  );
}
