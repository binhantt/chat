import type { CSSProperties } from "react";

export const chatShellStyle = {
  "--chat-bg": "var(--bg-primary)",
  "--chat-surface": "var(--chat-surface)",
  "--chat-surface-muted": "var(--chat-surface-muted)",
  "--chat-border": "var(--chat-border)",
  "--chat-text": "var(--text-primary)",
  "--chat-muted": "var(--text-secondary)",
  "--chat-accent": "var(--primary)",
  "--chat-accent-soft": "var(--chat-accent-soft)",
  "--chat-shadow": "none",
  background: "radial-gradient(circle at 12% 8%, var(--chat-accent-soft), transparent 28%), radial-gradient(circle at 86% 18%, var(--chat-accent-soft), transparent 24%), var(--bg-primary)",
} as CSSProperties;

export const chatPanelStyle = {
  borderColor: "var(--chat-border)",
  boxShadow: "none",
} as CSSProperties;

export const chatHeaderStyle = {
  background:
    "linear-gradient(90deg, var(--chat-accent-soft), var(--chat-surface))",
} as CSSProperties;
