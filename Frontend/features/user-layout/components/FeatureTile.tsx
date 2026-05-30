import type { ReactNode } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";

type FeatureTileProps = {
  description: string;
  icon: ReactNode;
  tone?: "blue" | "cyan" | "gold";
  title: string;
};

const toneColor = {
  blue: authTheme.control,
  cyan: authTheme.cyan,
  gold: authTheme.gold,
};

export function FeatureTile({
  description,
  icon,
  tone = "blue",
  title,
}: FeatureTileProps) {
  const color = toneColor[tone];

  return (
    <Box
      style={{
        background: `linear-gradient(180deg, ${authTheme.panelSoft}, rgba(255, 255, 255, 0.58))`,
        border: `1px solid ${authTheme.line}`,
        borderRadius: 8,
        boxShadow: "inset 0 1px 0 rgba(226, 232, 240, 0.04)",
        padding: 16,
      }}
    >
      <Flex align="start" gap="3">
        <Flex
          align="center"
          justify="center"
          style={{
            background: `linear-gradient(135deg, ${color}, rgba(34, 211, 238, 0.72))`,
            borderRadius: 8,
            color: tone === "gold" ? authTheme.background : "#FFFFFF",
            flexShrink: 0,
            height: 42,
            width: 42,
          }}
        >
          {icon}
        </Flex>
        <Box>
          <Text as="div" size="3" weight="bold" style={{ color: authTheme.text }}>
            {title}
          </Text>
          <Text as="div" size="2" style={{ color: authTheme.muted, lineHeight: 1.55 }}>
            {description}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
