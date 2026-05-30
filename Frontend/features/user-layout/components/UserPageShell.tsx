import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";

type UserPageShellProps = {
  children: ReactNode;
};

export function UserPageShell({ children }: UserPageShellProps) {
  return (
    <Box
      style={{
        background: `radial-gradient(circle at 14% 8%, rgba(59, 130, 246, 0.16), transparent 28%), radial-gradient(circle at 86% 10%, rgba(34, 211, 238, 0.10), transparent 24%), ${authTheme.background}`,
        color: authTheme.text,
        minHeight: "100%",
        padding: "22px clamp(16px, 2.2vw, 28px)",
      }}
    >
      <Flex
        direction="column"
        gap="4"
        style={{ margin: "0 auto", maxWidth: 1160, width: "100%" }}
      >
        {children}
      </Flex>
    </Box>
  );
}
