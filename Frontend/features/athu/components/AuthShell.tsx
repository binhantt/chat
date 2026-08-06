"use client";

import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <Box asChild style={{ background: "var(--auth-bg)", color: "var(--auth-text)", position: "relative", flex: 1, overflow: "hidden" }}>
      <main id="main-content" aria-label="Nội dung đăng nhập">
        {/* Gradient orbs - subtle ambient glow */}
        <Box aria-hidden="true" style={{ background: "radial-gradient(circle at center, var(--auth-panel-lift), transparent 70%)", borderRadius: "50%", height: 500, position: "absolute", right: -160, top: -200, width: 500, zIndex: 0 }} />
        <Box aria-hidden="true" style={{ background: "radial-gradient(circle at center, var(--auth-line), transparent 60%)", borderRadius: "50%", bottom: -200, height: 450, left: -140, position: "absolute", width: 450, zIndex: 0 }} />

        {/* Corner accents */}
        <Box aria-hidden="true" style={{ borderLeft: "2px solid var(--auth-line)", borderTop: "2px solid var(--auth-line)", borderTopLeftRadius: 12, height: 50, left: 32, position: "absolute", top: 32, width: 50, pointerEvents: "none", zIndex: 0 }} />
        <Box aria-hidden="true" style={{ borderRight: "2px solid var(--auth-line)", borderTop: "2px solid var(--auth-line)", borderTopRightRadius: 12, height: 50, position: "absolute", right: 32, top: 32, width: 50, pointerEvents: "none", zIndex: 0 }} />
        <Box aria-hidden="true" style={{ borderBottom: "2px solid var(--auth-line)", borderLeft: "2px solid var(--auth-line)", borderBottomLeftRadius: 12, bottom: 32, height: 50, left: 32, position: "absolute", width: 50, pointerEvents: "none", zIndex: 0 }} />
        <Box aria-hidden="true" style={{ borderBottom: "2px solid var(--auth-line)", borderRight: "2px solid var(--auth-line)", borderBottomRightRadius: 12, bottom: 32, height: 50, position: "absolute", right: 32, width: 50, pointerEvents: "none", zIndex: 0 }} />

        {/* Hero: login section */}
        <Flex
          align="center"
          justify="center"
          style={{
            marginInline: "auto",
            maxWidth: 1120,
            padding: "20px 24px",
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
          }}
        >
          {children}
        </Flex>
      </main>
    </Box>
  );
}
