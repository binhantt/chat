import { authTheme } from "@/features/athu/styles/authTheme";

export const usersPanelStyle = {
  background: "var(--auth-panel-gradient)",
  border: `1px solid ${authTheme.line}`,
  borderRadius: 8,
  padding: 16,
} as const;

export const usersSoftPanelStyle = {
  background: "var(--auth-soft-control)",
  border: `1px solid ${authTheme.line}`,
  borderRadius: 8,
  padding: 14,
} as const;
