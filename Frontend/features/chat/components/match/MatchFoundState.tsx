import { Button, Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";
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
  const displayName = matchResult.chatReady
    ? matchResult.matchedUser.fullName || matchResult.matchedUser.email
    : "Người đang chờ xác nhận";

  return (
    <MatchCard>
      <MatchIcon tone="green" />
      <Flex align="center" direction="column" gap="2" style={{ textAlign: "center" }}>
        <Text size="6" weight="bold" style={{ color: "#16a34a" }}>
          Đã tìm thấy
        </Text>
        <Text size="3" weight="medium" style={{ color: authTheme.text }}>
          {displayName}
        </Text>
        <Text size="2" style={{ color: authTheme.muted, lineHeight: 1.6, maxWidth: 360 }}>
          {matchResult.currentUserAccepted
            ? "Đang chờ người kia xác nhận."
            : "Bấm thích để bắt đầu mở phòng trò chuyện."}
        </Text>
      </Flex>
      <Flex gap="3" style={{ width: "100%" }}>
        <Button size="3" variant="soft" onClick={onDecline} style={{ borderRadius: 8, flex: 1 }}>
          Bỏ qua
        </Button>
        <Button
          size="3"
          onClick={onAccept}
          disabled={matchResult.currentUserAccepted === true}
          style={{
            background: "#16a34a",
            borderRadius: 8,
            color: "#FFFFFF",
            flex: 1,
            fontWeight: 700,
          }}
        >
          {matchResult.currentUserAccepted ? "Đang chờ" : "Thích"}
        </Button>
      </Flex>
    </MatchCard>
  );
}
