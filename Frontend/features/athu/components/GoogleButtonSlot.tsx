"use client";

import { useGoogleIdentity } from "../hooks/useGoogleIdentity";
import { Box } from "@radix-ui/themes";
import { authTheme } from "../styles/authTheme";

export function GoogleButtonSlot() {
  const { buttonRef } = useGoogleIdentity();

  return (
    <Box
      style={{
        background: "#FFFFFF",
        border: `1px solid ${authTheme.line}`,
        borderRadius: 8,
        boxShadow: "0 16px 34px rgba(59, 130, 246, 0.14)",
        minHeight: 50,
        overflow: "hidden",
        padding: 4,
      }}
    >
      <Box
        ref={buttonRef}
        style={{
          minHeight: 42,
          width: "100%",
        }}
      />
    </Box>
  );
}
