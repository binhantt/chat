
import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";

type AdminAuthShellProps = {
  children: ReactNode;
};

export function AdminAuthShell({ children }: AdminAuthShellProps) {
  return (
    <Box
      asChild
      style={{
        background: `radial-gradient(circle at 18% 18%, rgba(59, 130, 246, 0.18), transparent 28%), radial-gradient(circle at 84% 16%, rgba(34, 211, 238, 0.12), transparent 26%), ${authTheme.background}`,
        color: authTheme.text,
        height: "100dvh",
        overflow: "hidden",
        padding: 18,
      }}
    >
      <main>
        <Flex align="center" justify="center" style={{ height: "100%" }}>
          {children}
        </Flex>
      </main>
    </Box>
  );
}
