import { authTheme } from "@/features/athu/styles/authTheme";

export const conductPanelStyle = {
  background: authTheme.panel,
  border: `1px solid ${authTheme.line}`,
  borderRadius: 8,
  boxShadow: "var(--auth-shadow)",
  padding: 16,
} as const;

export const conductInnerBorder = `1px solid ${authTheme.line}`;
