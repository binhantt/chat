import { Button, Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";
import { MatchCard } from "./MatchCard";
import { MatchIcon } from "./MatchIcon";

type MatchEmptyStateProps = {
  onRetry: () => void;
};

export function MatchEmptyState({ onRetry }: MatchEmptyStateProps) {
  return (
    <MatchCard>
      <MatchIcon tone="muted" />
      <Flex align="center" direction="column" gap="2" style={{ textAlign: "center" }}>
        <Text size="6" weight="bold" style={{ color: authTheme.text }}>
          Chưa có kết quả
        </Text>
        <Text size="2" style={{ color: authTheme.muted, lineHeight: 1.6, maxWidth: 360 }}>
          Hiện chưa tìm thấy người phù hợp. Bạn có thể thử lại sau.
        </Text>
      </Flex>
      <Button size="3" variant="soft" onClick={onRetry} style={{ borderRadius: 8, width: "100%" }}>
        Thử lại
      </Button>
    </MatchCard>
  );
}
