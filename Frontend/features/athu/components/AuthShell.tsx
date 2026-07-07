"use client";

import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <Box asChild style={{ background: "var(--auth-bg)", color: "var(--auth-text)", position: "relative", flex: 1, overflow: "hidden" }}>
      <main>
        {/* Gradient orbs */}
        <Box style={{ background: "radial-gradient(circle at center, var(--auth-panel-lift), transparent 70%)", borderRadius: "50%", height: 500, position: "absolute", right: -160, top: -200, width: 500, zIndex: 0 }} />
        <Box style={{ background: "radial-gradient(circle at center, var(--auth-line), transparent 60%)", borderRadius: "50%", bottom: -200, height: 450, left: -140, position: "absolute", width: 450, zIndex: 0 }} />
        <Box style={{ background: "radial-gradient(circle at center, var(--auth-panel-lift), transparent 50%)", borderRadius: "50%", height: 300, left: "30%", position: "absolute", top: "10%", width: 300, zIndex: 0 }} />

        {/* Decorative sparkle crosses */}
        <Box style={{ color: "var(--auth-line)", fontSize: 16, left: "12%", position: "absolute", top: "15%", fontFamily: "serif", pointerEvents: "none", zIndex: 0 }}>✦</Box>
        <Box style={{ color: "var(--auth-line)", fontSize: 10, right: "18%", position: "absolute", top: "30%", fontFamily: "serif", pointerEvents: "none", zIndex: 0 }}>✦</Box>
        <Box style={{ color: "var(--auth-line)", fontSize: 14, bottom: "20%", left: "20%", position: "absolute", fontFamily: "serif", pointerEvents: "none", zIndex: 0 }}>✦</Box>
        <Box style={{ color: "var(--auth-line)", fontSize: 8, bottom: "35%", right: "14%", position: "absolute", fontFamily: "serif", pointerEvents: "none", zIndex: 0 }}>✦</Box>

        {/* Decorative corner accents */}
        <Box style={{ borderLeft: "2px solid var(--auth-line)", borderTop: "2px solid var(--auth-line)", borderTopLeftRadius: 12, height: 50, left: 32, position: "absolute", top: 32, width: 50, pointerEvents: "none", zIndex: 0 }} />
        <Box style={{ borderRight: "2px solid var(--auth-line)", borderTop: "2px solid var(--auth-line)", borderTopRightRadius: 12, height: 50, position: "absolute", right: 32, top: 32, width: 50, pointerEvents: "none", zIndex: 0 }} />
        <Box style={{ borderBottom: "2px solid var(--auth-line)", borderLeft: "2px solid var(--auth-line)", borderBottomLeftRadius: 12, bottom: 32, height: 50, left: 32, position: "absolute", width: 50, pointerEvents: "none", zIndex: 0 }} />
        <Box style={{ borderBottom: "2px solid var(--auth-line)", borderRight: "2px solid var(--auth-line)", borderBottomRightRadius: 12, bottom: 32, height: 50, position: "absolute", right: 32, width: 50, pointerEvents: "none", zIndex: 0 }} />

        {/* Decorative dots */}
        {[
          { left: "5%", top: "22%", s: 5 }, { left: "92%", top: "18%", s: 4 },
          { left: "8%", top: "72%", s: 4 }, { left: "88%", top: "68%", s: 5 },
          { left: "50%", top: "6%", s: 3 }, { left: "48%", top: "92%", s: 3 },
        ].map((p, i) => (
          <Box key={i} style={{ background: i % 2 === 0 ? "var(--auth-border)" : "var(--auth-muted)", borderRadius: "50%", height: p.s, left: p.left, opacity: 0.12, position: "absolute", top: p.top, width: p.s, pointerEvents: "none", zIndex: 0 }} />
        ))}

        {/* Decorative diamonds */}
        <Box style={{ border: "1px solid var(--auth-line)", height: 18, left: "6%", position: "absolute", top: "45%", transform: "rotate(45deg)", width: 18, pointerEvents: "none", zIndex: 0 }} />
        <Box style={{ border: "1px solid var(--auth-line)", bottom: "40%", height: 14, position: "absolute", right: "6%", transform: "rotate(45deg)", width: 14, pointerEvents: "none", zIndex: 0 }} />

        {/* Decorative floating ring */}
        <Box style={{ border: "1px solid var(--auth-line)", borderRadius: "50%", height: 220, left: "22%", position: "absolute", top: "18%", width: 220, pointerEvents: "none", zIndex: 0 }} />
        <Box style={{ border: "1px solid var(--auth-line)", borderRadius: "50%", bottom: "15%", height: 160, position: "absolute", right: "20%", width: 160, pointerEvents: "none", zIndex: 0 }} />

        {/* Hero: login section */}
        <Flex
          align="center"
          justify="center"
          style={{
            marginInline: "auto",
            maxWidth: 1120,
            padding: "40px 20px",
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          {children}
        </Flex>
      </main>
    </Box>
  );
}
