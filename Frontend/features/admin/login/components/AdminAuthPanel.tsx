
import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";

type AdminAuthPanelProps = {
  children: ReactNode;
};

export function AdminAuthPanel({ children }: AdminAuthPanelProps) {
  return (
    <Box
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.9))",
        border: `1px solid ${authTheme.line}`,
        borderRadius: 8,
        maxWidth: 420,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <Box
        style={{
          background: `linear-gradient(90deg, ${authTheme.control}, ${authTheme.cyan}, ${authTheme.gold})`,
          height: 3,
          width: "100%",
        }}
      />
      <Flex direction="column" gap="4" p="5">
        {children}
      </Flex>
    </Box>
  );
}
