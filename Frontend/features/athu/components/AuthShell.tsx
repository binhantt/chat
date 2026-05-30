"use client";

import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { authTheme } from "../styles/authTheme";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <Box
      asChild
      style={{
        background: `radial-gradient(circle at 18% 18%, rgba(59, 130, 246, 0.18), transparent 28%), radial-gradient(circle at 84% 16%, rgba(34, 211, 238, 0.14), transparent 26%), ${authTheme.background}`,
        color: authTheme.text,
        height: "100dvh",
        overflow: "hidden",
        padding: 18,
        position: "relative",
      }}
    >
      <main>
        <Box
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.18), transparent)",
            height: 1,
            left: 0,
            position: "absolute",
            right: 0,
            top: 70,
          }}
        />
        <Box
          style={{
            background:
              "linear-gradient(180deg, rgba(59, 130, 246, 0.18), transparent)",
            bottom: -150,
            height: 320,
            position: "absolute",
            right: "8%",
            transform: "rotate(12deg)",
            width: 180,
          }}
        />
        <Flex
          align="center"
          gap="8"
          justify="between"
          style={{
            boxSizing: "border-box",
            height: "100dvh",
            margin: "-18px",
            marginInline: "auto",
            maxWidth: 1280,
            padding: 18,
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
          wrap="nowrap"
        >
          {children}
        </Flex>
      </main>
    </Box>
  );
}
