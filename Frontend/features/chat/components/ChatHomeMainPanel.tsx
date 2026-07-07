"use client";

import { Box } from "@radix-ui/themes";
import { ChatArea } from "./ChatArea";
import { ChatWelcomePanel } from "./ChatWelcomePanel";
import { MatchPeople } from "./MatchPeople";
import { SearchConversationsPage } from "./SearchConversationsPage";
import type { CenterMode, MatchedUser } from "../types";

type ChatHomeMainPanelProps = {
  conversationId: string | null;
  matchedUser: MatchedUser | null;
  mode: CenterMode;
  onBack: () => void;
  onCancelMatch: () => void;
  onMatched: (convId: string, matched: MatchedUser) => void;
  onSearch: () => void;
  onSelectConversation: (convId: string, partner: MatchedUser) => void;
  selectedUser: string | null;
};

export function ChatHomeMainPanel({
  conversationId,
  matchedUser,
  mode,
  onBack,
  onCancelMatch,
  onMatched,
  onSearch,
  onSelectConversation,
  selectedUser,
}: ChatHomeMainPanelProps) {
  // Chat mode: show the conversation
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

  // Search mode: show the styled search conversations page
  if (mode === "search") {
    return (
      <Box
        className="chat-main-panel"
        style={{
          alignItems: "flex-start",
          display: "flex",
          justifyContent: "flex-start",
          minHeight: 0,
          minWidth: 0,
          position: "relative",
          width: "100%",
          overflow: "auto",
        }}
      >
        <SearchConversationsPage
          selectedConversationId={conversationId}
          onSelectConversation={onSelectConversation}
        />
      </Box>
    );
  }

  // Welcome mode: show the welcome panel
  if (mode === "welcome") {
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
        }}
      >
        <ChatWelcomePanel onMatch={onCancelMatch} onSearch={onSearch} />
      </Box>
    );
  }

  // Match mode (default): decorative + MatchPeople
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
      }}
    >
      {/* Outer decorative border frame */}
      <Box
        style={{
          border: "1px solid var(--chat-border)",
          borderRadius: 24,
          bottom: 12,
          left: 12,
          position: "absolute",
          right: 12,
          top: 12,
          pointerEvents: "none",
        }}
      />

      {/* Decorative top accent bar */}
      <Box
        style={{
          background: "linear-gradient(90deg, var(--primary), var(--secondary), var(--secondary-light), var(--secondary), var(--primary))",
          height: 4,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
          zIndex: 1,
        }}
      />

      {/* Bottom decorative line */}
      <Box
        style={{
          background: "linear-gradient(90deg, transparent, var(--chat-border), transparent)",
          bottom: 0,
          height: 1,
          left: "10%",
          position: "absolute",
          right: "10%",
          pointerEvents: "none",
        }}
      />

      {/* Sparkle / cross shapes */}
      <Box
        style={{
          color: "var(--chat-border)",
          fontSize: 18,
          left: "14%",
          position: "absolute",
          top: "20%",
          fontFamily: "serif",
          pointerEvents: "none",
        }}
      >
        ✦
      </Box>
      <Box
        style={{
          color: "var(--chat-border)",
          fontSize: 12,
          position: "absolute",
          right: "16%",
          top: "28%",
          fontFamily: "serif",
          pointerEvents: "none",
        }}
      >
        ✦
      </Box>
      <Box
        style={{
          bottom: "22%",
          color: "var(--chat-border)",
          fontSize: 14,
          left: "18%",
          position: "absolute",
          fontFamily: "serif",
          pointerEvents: "none",
        }}
      >
        ✦
      </Box>
      <Box
        style={{
          bottom: "30%",
          color: "var(--chat-border)",
          fontSize: 10,
          position: "absolute",
          right: "12%",
          fontFamily: "serif",
          pointerEvents: "none",
        }}
      >
        ✦
      </Box>

      {/* Decorative corner accents */}
      <Box
        style={{
          borderLeft: "2px solid var(--chat-border)",
          borderTop: "2px solid var(--chat-border)",
          borderTopLeftRadius: 12,
          height: 40,
          left: 24,
          position: "absolute",
          top: 24,
          width: 40,
          pointerEvents: "none",
        }}
      />
      <Box
        style={{
          borderRight: "2px solid var(--chat-border)",
          borderTop: "2px solid var(--chat-border)",
          borderTopRightRadius: 12,
          height: 40,
          position: "absolute",
          right: 24,
          top: 24,
          width: 40,
          pointerEvents: "none",
        }}
      />
      <Box
        style={{
          borderBottom: "2px solid var(--chat-border)",
          borderLeft: "2px solid var(--chat-border)",
          borderBottomLeftRadius: 12,
          bottom: 24,
          height: 40,
          left: 24,
          position: "absolute",
          width: 40,
          pointerEvents: "none",
        }}
      />
      <Box
        style={{
          borderBottom: "2px solid var(--chat-border)",
          borderRight: "2px solid var(--chat-border)",
          borderBottomRightRadius: 12,
          bottom: 24,
          height: 40,
          position: "absolute",
          right: 24,
          width: 40,
          pointerEvents: "none",
        }}
      />

      {/* Side decorative dashed lines */}
      <Box
        style={{
          borderRight: "1px dashed var(--chat-border)",
          height: "60%",
          left: 56,
          position: "absolute",
          top: "20%",
          width: 0,
          pointerEvents: "none",
        }}
      />
      <Box
        style={{
          borderLeft: "1px dashed var(--chat-border)",
          height: "60%",
          position: "absolute",
          right: 56,
          top: "20%",
          width: 0,
          pointerEvents: "none",
        }}
      />

      {/* Decorative small dots */}
      {[
        { left: "12%", top: "12%" },
        { left: "88%", top: "18%" },
        { left: "15%", top: "80%" },
        { left: "82%", top: "76%" },
        { left: "50%", top: "8%" },
        { left: "45%", top: "90%" },
      ].map((pos, i) => (
        <Box
          key={i}
          style={{
            background: i % 2 === 0 ? "var(--primary)" : "var(--secondary-light)",
            borderRadius: "50%",
            height: i === 1 || i === 4 ? 5 : 3,
            left: pos.left,
            opacity: i % 2 === 0 ? 0.2 : 0.15,
            position: "absolute",
            top: pos.top,
            width: i === 1 || i === 4 ? 5 : 3,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Decorative diamond shapes */}
      <Box
        style={{
          border: "1px solid var(--chat-border)",
          height: 16,
          left: "7%",
          position: "absolute",
          top: "40%",
          transform: "rotate(45deg)",
          width: 16,
          pointerEvents: "none",
        }}
      />
      <Box
        style={{
          border: "1px solid var(--chat-border)",
          bottom: "35%",
          height: 12,
          position: "absolute",
          right: "7%",
          transform: "rotate(45deg)",
          width: 12,
          pointerEvents: "none",
        }}
      />
      <Box
        style={{
          border: "1px solid var(--chat-border)",
          height: 20,
          left: "92%",
          position: "absolute",
          top: "55%",
          transform: "rotate(45deg)",
          width: 20,
          pointerEvents: "none",
        }}
      />

      {/* Decorative floating circles */}
      <Box
        style={{
          background: "radial-gradient(circle at center, var(--chat-accent-soft), transparent 70%)",
          borderRadius: "50%",
          height: 300,
          left: "5%",
          position: "absolute",
          top: "15%",
          width: 300,
          pointerEvents: "none",
        }}
      />
      <Box
        style={{
          background: "radial-gradient(circle at center, var(--chat-surface-muted), transparent 60%)",
          borderRadius: "50%",
          bottom: "10%",
          height: 250,
          position: "absolute",
          right: "8%",
          width: 250,
          pointerEvents: "none",
        }}
      />
      <Box
        style={{
          background: "radial-gradient(circle at center, var(--chat-surface-muted), transparent 50%)",
          borderRadius: "50%",
          height: 180,
          left: "40%",
          position: "absolute",
          top: "5%",
          width: 180,
          pointerEvents: "none",
        }}
      />

      <MatchPeople onMatched={onMatched} onCancel={onCancelMatch} />
    </Box>
  );
}
