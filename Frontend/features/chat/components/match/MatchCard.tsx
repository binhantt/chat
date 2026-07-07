import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";

type MatchCardProps = {
  children: ReactNode;
};

export function MatchCard({ children }: MatchCardProps) {
  return (
    <Box
      style={{
        background: "var(--chat-surface)",
        borderRadius: 24,
        boxShadow: "var(--chat-shadow)",
        maxWidth: 420,
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative gradient glow */}
      <Box
        style={{
          background: "radial-gradient(circle at 30% 20%, var(--chat-accent-soft), transparent 50%)",
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />
      <Flex
        align="center"
        direction="column"
        gap="5"
        p="7"
        style={{ position: "relative", zIndex: 1 }}
      >
        {children}
      </Flex>
    </Box>
  );
}
