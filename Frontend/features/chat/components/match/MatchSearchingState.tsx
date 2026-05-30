import { Button, Flex, Spinner, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";
import { MatchCard } from "./MatchCard";
import { MatchIcon } from "./MatchIcon";

type MatchSearchingStateProps = {
  onStop: () => void;
};

export function MatchSearchingState({ onStop }: MatchSearchingStateProps) {
  return (
    <MatchCard>
      <MatchIcon />
      <Flex align="center" direction="column" gap="2" style={{ textAlign: "center" }}>
        <Spinner size="3" />
        <Text size="6" weight="bold" style={{ color: authTheme.text }}>
          Đang tìm người phù hợp
        </Text>
        <Text size="2" style={{ color: authTheme.muted, lineHeight: 1.6, maxWidth: 360 }}>
          Hệ thống đang tìm người online để bắt đầu cuộc trò chuyện.
        </Text>
      </Flex>
      <Button
        size="3"
        variant="soft"
        onClick={onStop}
        style={{
          borderRadius: 8,
          fontWeight: 700,
          minHeight: 44,
          width: "100%",
        }}
      >
        Hủy tìm kiếm
      </Button>
    </MatchCard>
  );
}
