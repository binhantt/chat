"use client";

import { Button, Flex, Text } from "@radix-ui/themes";
import type { MatchResult } from "../../store/useMatchUiStore";
import { MatchCard } from "./MatchCard";
import { MatchIcon } from "./MatchIcon";

type MatchFoundStateProps = {
  matchResult: MatchResult;
  onAccept: () => void;
  onDecline: () => void;
};

export function MatchFoundState({
  matchResult,
  onAccept,
  onDecline,
}: MatchFoundStateProps) {
  const displayName =
    matchResult.matchedUser.fullName || matchResult.matchedUser.email;

  return (
    <MatchCard>
      <MatchIcon tone="found" />
      <Flex align="center" direction="column" gap="2" style={{ textAlign: "center" }}>
        <Text
          size="5"
          weight="bold"
          style={{ color: "var(--chat-accent)", fontFamily: "var(--font-heading)" }}
        >
          Đã tìm thấy!
        </Text>
        <Text size="3" weight="medium" style={{ color: "var(--text-primary)" }}>
          {displayName}
        </Text>
        <Text
          size="2"
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.6,
            maxWidth: 320,
          }}
        >
          {matchResult.currentUserAccepted
            ? "Đang chờ người kia xác nhận."
            : "Bấm thích để bắt đầu mở phòng trò chuyện."}
        </Text>
      </Flex>
      <Flex gap="3" style={{ width: "100%" }}>
        <Button
          size="3"
          variant="soft"
          onClick={onDecline}
          style={{ borderRadius: 10, flex: 1, minHeight: 44, fontWeight: 600 }}
        >
          Bỏ qua
        </Button>
        <Button
          size="3"
          onClick={onAccept}
          disabled={matchResult.currentUserAccepted === true}
          style={{
            background: matchResult.currentUserAccepted
              ? "var(--chat-surface-muted)"
              : "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
            borderRadius: 10,
            color: "#FFFFFF",
            flex: 1,
            fontWeight: 600,
            minHeight: 44,
          }}
        >
          {matchResult.currentUserAccepted ? "Đang chờ" : "Thích"}
        </Button>
      </Flex>
    </MatchCard>
  );
}
