"use client";

import { useGoogleIdentity } from "../hooks/useGoogleIdentity";
import { Box, Flex, Text } from "@radix-ui/themes";
import { useAuthUiStore } from "../store/useAuthUiStore";

export function GoogleButtonSlot() {
  const { buttonRef } = useGoogleIdentity();
  const googleReady = useAuthUiStore((state) => state.isGoogleReady);

  return (
    <Box style={{ width: "100%", position: "relative" }}>
      {/* Loading placeholder */}
      {!googleReady && (
        <Flex
          align="center"
          justify="center"
          gap="2"
          style={{
            width: "100%",
            minHeight: 50,
            borderRadius: 8,
            border: "1px solid var(--auth-line)",
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
            Đang tải...
          </Text>
        </Flex>
      )}

      {/* Google rendered button container */}
      <Box
        ref={buttonRef}
        style={{
          minHeight: 48,
          width: "100%",
          visibility: googleReady ? "visible" : "hidden",
          position: googleReady ? "relative" : "absolute",
        }}
      />
    </Box>
  );
}
