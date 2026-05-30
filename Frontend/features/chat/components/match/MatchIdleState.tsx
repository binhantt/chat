import { Button, Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";
import { MatchCard } from "./MatchCard";
import { MatchIcon } from "./MatchIcon";

type MatchIdleStateProps = {
  onStart: () => void;
};

export function MatchIdleState({ onStart }: MatchIdleStateProps) {
  return (
    <MatchCard>
      <MatchIcon />
      <Flex align="center" direction="column" gap="2" style={{ textAlign: "center" }}>
        <Text size="6" weight="bold" style={{ color: authTheme.text }}>
          Tìm kiếm người
        </Text>
        <Text size="2" style={{ color: authTheme.muted, lineHeight: 1.6, maxWidth: 360 }}>
          Bấm bắt đầu để hệ thống tìm một người đang sẵn sàng trò chuyện.
        </Text>
      </Flex>
      <Button
        size="3"
        onClick={onStart}
        style={{
          background: authTheme.control,
          borderRadius: 8,
          color: "#FFFFFF",
          fontWeight: 700,
          minHeight: 44,
          width: "100%",
        }}
      >
        Bắt đầu tìm kiếm
      </Button>
    </MatchCard>
  );
}
