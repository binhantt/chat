import type { ReactNode } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";

type FeatureTileProps = {
  description: string;
  icon: ReactNode;
  tone?: "primary" | "light" | "blue" | "cyan" | "gold";
  title: string;
};

export function FeatureTile({
  description,
  icon,
  tone = "primary",
  title,
}: FeatureTileProps) {
  const gradient =
    tone === "light" || tone === "cyan"
      ? "linear-gradient(135deg, var(--secondary), var(--secondary-light))"
      : "linear-gradient(135deg, var(--chat-accent), var(--secondary))";

  return (
    <Box
      style={{
        background: "var(--chat-surface)",
        border: "1px solid var(--chat-border)",
        borderRadius: 12,
        padding: 18,
      }}
    >
      <Flex align="start" gap="3">
        <Flex
          align="center"
          justify="center"
          style={{
            background: gradient,
            borderRadius: 10,
            color: "#FFFFFF",
            flexShrink: 0,
            height: 42,
            width: 42,
          }}
        >
          {icon}
        </Flex>
        <Box>
          <Text as="div" size="3" weight="bold" style={{ color: "var(--chat-text)" }}>
            {title}
          </Text>
          <Text as="div" size="2" style={{ color: "var(--chat-muted)", lineHeight: 1.55 }}>
            {description}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
