import type { CSSProperties } from "react";
import { authTheme } from "@/features/athu/styles/authTheme";

export const chatShellStyle = {
  "--chat-bg": authTheme.background,
  "--chat-surface": "rgba(255, 255, 255, 0.94)",
  "--chat-surface-muted": "rgba(239, 246, 255, 0.90)",
  "--chat-border": "rgba(59, 130, 246, 0.18)",
  "--chat-text": authTheme.text,
  "--chat-muted": authTheme.muted,
  "--chat-accent": authTheme.control,
  "--chat-accent-soft": "rgba(59, 130, 246, 0.12)",
  "--chat-shadow": "none",
  background: `radial-gradient(circle at 12% 8%, rgba(59, 130, 246, 0.16), transparent 28%), radial-gradient(circle at 86% 18%, rgba(34, 211, 238, 0.12), transparent 24%), ${authTheme.background}`,
} as CSSProperties;

export const chatPanelStyle = {
  borderColor: authTheme.line,
  boxShadow: "none",
} as CSSProperties;

export const chatHeaderStyle = {
  background:
    "linear-gradient(90deg, rgba(59, 130, 246, 0.12), rgba(255, 255, 255, 0.72))",
} as CSSProperties;
