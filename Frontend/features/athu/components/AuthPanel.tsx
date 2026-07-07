"use client";

import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";

type AuthPanelProps = {
  children: ReactNode;
};

export function AuthPanel({ children }: AuthPanelProps) {
  return (
    <Box
      style={{
        background: "var(--auth-panel)",
        border: "1px solid var(--auth-line)",
        borderRadius: 20,
        boxShadow: "var(--auth-shadow)",
        flexShrink: 0,
        maxWidth: 400,
        overflow: "hidden",
        padding: 0,
        position: "relative",
        width: "100%",
      }}
    >
      {/* Purple accent bar */}
      <Box
        style={{
          background: "linear-gradient(90deg, var(--auth-border), var(--auth-muted), var(--auth-panel-soft))",
          height: 4,
          width: "100%",
        }}
      />
      <Box px={{ initial: "5", sm: "6", md: "7" }} py={{ initial: "5", sm: "6", md: "7" }}>
        <Flex direction="column" gap="5">
          {children}
        </Flex>
      </Box>
    </Box>
  );
}
