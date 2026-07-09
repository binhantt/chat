"use client";

import { useGoogleIdentity } from "../hooks/useGoogleIdentity";
import { Box, Flex, Text } from "@radix-ui/themes";
import { useAuthUiStore } from "../store/useAuthUiStore";
import { useEffect, useRef, useState } from "react";

export function GoogleButtonSlot() {
  const { buttonRef, triggerGoogle } = useGoogleIdentity();
  const googleReady = useAuthUiStore((state) => state.isGoogleReady);
  const isSubmitting = useAuthUiStore((state) => state.isSubmitting);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box style={{ width: "100%" }}>
      {/* Hidden container for Google's rendered button (iframe) */}
      <Box
        ref={buttonRef}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* Custom styled Google button */}
      <button
        type="button"
        aria-label="Đăng nhập bằng Google"
        disabled={isSubmitting || !googleReady}
        onClick={() => triggerGoogle?.()}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          width: "100%",
          minHeight: 52,
          padding: "0 24px",
          border: `1px solid ${isHovered ? "var(--auth-muted)" : "var(--auth-line)"}`,
          borderRadius: 12,
          background: isHovered
            ? "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))"
            : "var(--auth-panel)",
          boxShadow: isHovered
            ? "0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)"
            : "0 1px 2px rgba(0,0,0,0.04)",
          color: "var(--auth-text)",
          fontSize: 15,
          fontWeight: 500,
          fontFamily: "var(--font-body)",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.6 : 1,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Google G Logo */}
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
        <span>Đăng nhập với Google</span>
      </button>

      {/* Loading state overlay */}
      {isSubmitting && (
        <Flex
          align="center"
          justify="center"
          gap="2"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            background: "var(--auth-panel)",
          }}
        >
          <Box
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: "2px solid var(--auth-line)",
              borderTopColor: "var(--auth-control)",
              animation: "spin 0.6s linear infinite",
            }}
          />
          <Text size="2" style={{ color: "var(--auth-muted)" }}>
            Đang đăng nhập...
          </Text>
        </Flex>
      )}
    </Box>
  );
}
