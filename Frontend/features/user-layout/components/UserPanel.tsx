import type { ReactNode } from "react";
import { Box } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";

type UserPanelProps = {
  borderless?: boolean;
  children: ReactNode;
  maxWidth?: number;
  padding?: "4" | "5" | "6";
};

export function UserPanel({
  borderless = false,
  children,
  maxWidth,
  padding = "5",
}: UserPanelProps) {
  return (
    <Box
      style={{
        background: borderless
          ? "transparent"
          : `linear-gradient(180deg, ${authTheme.panelLift}, ${authTheme.panel})`,
        border: borderless ? "none" : `1px solid ${authTheme.line}`,
        borderRadius: 8,
        boxShadow: "none",
        maxWidth,
        overflow: "hidden",
        position: "relative",
        width: "100%",
      }}
    >
      {!borderless && (
        <Box
          style={{
            background: `linear-gradient(90deg, ${authTheme.control}, ${authTheme.cyan}, ${authTheme.gold})`,
            height: 3,
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
            width: "100%",
          }}
        />
      )}
      <Box p={padding} style={{ paddingTop: padding === "4" ? 18 : padding === "6" ? 26 : 22 }}>
        {children}
      </Box>
    </Box>
  );
}
