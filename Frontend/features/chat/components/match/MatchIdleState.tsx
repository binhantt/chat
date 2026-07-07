"use client";

import { Flex, Text, Box } from "@radix-ui/themes";
import { MatchCard } from "./MatchCard";
import { ProfileSetupPrompt } from "./ProfileSetupPrompt";

type MatchIdleStateProps = {
  onStart: () => void;
  user?: { gender?: string | null; city?: string | null } | null;
  hasCompleteProfile?: boolean;
};

export function MatchIdleState({ onStart, user, hasCompleteProfile }: MatchIdleStateProps) {
  // Nếu chưa hoàn thành hồ sơ, hiển thị prompt cập nhật
  if (!hasCompleteProfile) {
    return <ProfileSetupPrompt />;
  }

  return (
    <MatchCard>
      {/* Decorative icon area */}
      <Flex align="center" justify="center" style={{ position: "relative", width: 80, height: 80 }}>
        {/* Outer ring */}
        <Box style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", border: "2px solid var(--chat-border)" }} />
        {/* Inner ring */}
        <Box style={{ position: "absolute", width: 60, height: 60, borderRadius: "50%", border: "2px solid var(--chat-border)" }} />
        {/* Center icon */}
        <Flex
          align="center"
          justify="center"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
            color: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(75,46,131,0.15)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </Flex>
      </Flex>

      <Flex align="center" direction="column" gap="2" style={{ textAlign: "center" }}>
        <Text size="6" weight="bold" style={{ color: "var(--chat-text)", fontFamily: "var(--font-heading)", lineHeight: 1.15 }}>
          Tìm kiếm người
        </Text>
        <Text size="2" style={{ color: "var(--chat-muted)", fontFamily: "var(--font-body)", lineHeight: 1.7, maxWidth: 300 }}>
          Bấm bắt đầu để hệ thống tìm một người đang sẵn sàng trò chuyện.
        </Text>
      </Flex>

      {/* Button */}
      <button
        type="button"
        onClick={onStart}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "16px 0",
          border: "none",
          borderRadius: 14,
          background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
          color: "#FFFFFF",
          fontSize: 17,
          fontWeight: 700,
          fontFamily: "var(--font-body)",
          cursor: "pointer",
          letterSpacing: "0.01em",
          boxShadow: "0 4px 14px rgba(75,46,131,0.2)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(75,46,131,0.3)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(75,46,131,0.2)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Bắt đầu tìm kiếm
      </button>
    </MatchCard>
  );
}
