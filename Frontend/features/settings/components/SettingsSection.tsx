import type { ReactNode } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";

type SettingsSectionProps = {
  children: ReactNode;
  description?: string;
  icon: ReactNode;
  title: string;
};

export function SettingsSection({
  children,
  description,
  icon,
  title,
}: SettingsSectionProps) {
  return (
    <Box
      style={{
        background:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.86))",
        border: "1px solid var(--chat-border)",
        borderRadius: 8,
        overflow: "hidden",
        padding: 16,
        position: "relative",
      }}
    >
      <Box
        style={{
          background: "linear-gradient(90deg, var(--primary), #22d3ee)",
          height: 3,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      <Flex direction="column" gap="4">
        <Flex align="center" gap="3">
          <Flex
            align="center"
            justify="center"
            style={{
              background: "rgba(168, 85, 247, 0.08)",
              borderRadius: 8,
              color: "var(--primary)",
              height: 36,
              width: 36,
            }}
          >
            {icon}
          </Flex>
          <Box>
            <Text as="div" size="3" weight="bold" style={{ color: "var(--text-primary)" }}>
              {title}
            </Text>
            {description && (
              <Text as="div" size="1" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {description}
              </Text>
            )}
          </Box>
        </Flex>
        {children}
      </Flex>
    </Box>
  );
}
