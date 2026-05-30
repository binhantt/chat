import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";

type MatchCardProps = {
  children: ReactNode;
};

export function MatchCard({ children }: MatchCardProps) {
  return (
    <Box
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.9))",
        border: `1px solid ${authTheme.line}`,
        borderRadius: 8,
        maxWidth: 520,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <Box
        style={{
          background: `linear-gradient(90deg, ${authTheme.control}, ${authTheme.cyan})`,
          height: 3,
          width: "100%",
        }}
      />
      <Flex align="center" direction="column" gap="4" p="5">
        {children}
      </Flex>
    </Box>
  );
}
