"use client";

import { Button } from "@radix-ui/themes";
import { authTheme } from "../styles/authTheme";

type GoogleLoadingButtonProps = {
  isVisible: boolean;
};

export function GoogleLoadingButton({ isVisible }: GoogleLoadingButtonProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Button
      disabled
      size="3"
      variant="solid"
      style={{
        background: authTheme.control,
        borderRadius: 8,
        color: "#FFFFFF",
        minHeight: 48,
        width: "100%",
      }}
    >
      Đang đăng nhập...
    </Button>
  );
}
