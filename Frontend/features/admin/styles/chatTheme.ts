import { authTheme } from "@/features/athu/styles/authTheme";

export const chatPanelStyle = {
  background: authTheme.panel,
  borderRadius: 8,
  boxShadow: "var(--auth-shadow)",
  padding: 18,
} as const;

export const chatInnerBorder = `1px solid ${authTheme.line}`;
