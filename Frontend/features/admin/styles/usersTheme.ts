import { authTheme } from "@/features/athu/styles/authTheme";

export const usersPanelStyle = {
  background: authTheme.panel,
  borderRadius: 8,
  boxShadow: "var(--auth-shadow)",
  padding: 18,
} as const;

export const usersSoftPanelStyle = {
  background: "#FFFFFF",
  border: `1px solid ${authTheme.line}`,
  borderRadius: 8,
  padding: 14,
} as const;

export const usersInnerBorder = `1px solid ${authTheme.line}`;
