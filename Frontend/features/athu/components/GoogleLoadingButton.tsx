"use client";

import { Button } from "@radix-ui/themes";

type GoogleLoadingButtonProps = {
  isVisible: boolean;
};

export function GoogleLoadingButton({ isVisible }: GoogleLoadingButtonProps) {
  if (!isVisible) return null;

  return (
    <Button
      disabled
      size="3"
      variant="solid"
      style={{
        background: "linear-gradient(135deg, #4B2E83, #6B4FA0)",
        borderRadius: 12,
        color: "#FFFFFF",
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        minHeight: 48,
        width: "100%",
        cursor: "not-allowed",
        opacity: 0.85,
      }}
    >
      Đang đăng nhập…
    </Button>
  );
}
