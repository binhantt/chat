import { Button, Flex, Text } from "@radix-ui/themes";
import { MatchCard } from "./MatchCard";
import { MatchIcon } from "./MatchIcon";

type MatchEmptyStateProps = {
  onRetry: () => void;
};

export function MatchEmptyState({ onRetry }: MatchEmptyStateProps) {
  return (
    <MatchCard>
      <MatchIcon tone="empty" />
      <Flex align="center" direction="column" gap="2" style={{ textAlign: "center" }}>
        <Text
          size="5"
          weight="bold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-heading)",
          }}
        >
          Chưa có kết quả
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
          Hiện chưa tìm thấy người phù hợp. Bạn có thể thử lại sau.
        </Text>
      </Flex>
      <Button
        size="3"
        variant="soft"
        onClick={onRetry}
        style={{ borderRadius: 12, fontWeight: 600, minHeight: 44, width: "100%" }}
      >
        Thử lại
      </Button>
    </MatchCard>
  );
}
