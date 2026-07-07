"use client";

import { Flex, Spinner, Text } from "@radix-ui/themes";
import { MatchCard } from "./MatchCard";
import { MatchIcon } from "./MatchIcon";

type MatchSearchingStateProps = {
  onStop: () => void;
};

export function MatchSearchingState({ onStop }: MatchSearchingStateProps) {
  return (
    <MatchCard>
      <MatchIcon tone="searching" />
      <Flex align="center" direction="column" gap="3" style={{ textAlign: "center" }}>
        <Spinner size="3" />
        <Text
          size="5"
          weight="bold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-heading)",
          }}
        >
          Đang tìm người phù hợp
        </Text>
        <Text
          size="2"
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.7,
            maxWidth: 300,
          }}
        >
          Hệ thống đang tìm người online để bắt đầu cuộc trò chuyện.
        </Text>
      </Flex>
      <button
        type="button"
        onClick={onStop}
        style={{
          background: "transparent",
          border: "1.5px solid var(--chat-border)",
          borderRadius: 14,
          color: "var(--chat-text)",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          fontSize: 16,
          fontWeight: 600,
          height: 50,
          transition: "all 0.2s ease",
          width: "100%",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--chat-accent)";
          e.currentTarget.style.background = "var(--chat-accent-soft)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--chat-border)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        Hủy tìm kiếm
      </button>
    </MatchCard>
  );
}
