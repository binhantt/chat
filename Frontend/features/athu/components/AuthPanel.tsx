"use client";

import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { authTheme } from "../styles/authTheme";

type AuthPanelProps = {
  children: ReactNode;
};

export function AuthPanel({ children }: AuthPanelProps) {
  return (
    <Box
      style={{
        background:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.90))",
        border: `1px solid ${authTheme.line}`,
        borderRadius: 8,
        boxShadow:
          "0 28px 70px rgba(15, 23, 42, 0.16), 0 18px 42px rgba(59, 130, 246, 0.10)",
        flexShrink: 0,
        maxHeight: "calc(100dvh - 36px)",
        maxWidth: 400,
        overflow: "hidden",
        padding: 0,
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
      <Box px="5" py="5" style={{ background: "rgba(255, 255, 255, 0.50)" }}>
        <Flex direction="column" gap="4">
          {children}
        </Flex>
      </Box>
    </Box>
  );
}
