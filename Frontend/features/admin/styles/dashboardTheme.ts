import { authTheme } from "@/features/athu/styles/authTheme";

export const adminPanelStyle = {
  background: "var(--auth-panel-gradient)",
  border: `1px solid ${authTheme.line}`,
  borderRadius: 8,
  padding: 16,
} as const;

export const adminHeroStyle = {
  background: "var(--auth-hero-gradient)",
  border: `1px solid ${authTheme.line}`,
  borderRadius: 8,
  padding: 18,
} as const;
