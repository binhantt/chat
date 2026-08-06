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
        flex: 1,
        minWidth: 0,
        maxWidth: 480,
        overflow: "hidden",
        padding: 0,
        position: "relative",
      }}
    >
      {/* Purple accent bar */}
      <Box
        style={{
          background: "linear-gradient(90deg, var(--auth-control), var(--auth-muted), transparent)",
          height: 4,
          width: "100%",
        }}
      />
      <Box px={{ initial: "4", sm: "5", md: "6" }} py={{ initial: "4", sm: "5", md: "6" }}>
        <Flex direction="column" gap="4">
          {children}
        </Flex>
      </Box>
    </Box>
  );
}
