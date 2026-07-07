import type { ReactNode } from "react";
import { Box } from "@radix-ui/themes";

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
        background: borderless ? "transparent" : "#FFFFFF",
        border: borderless ? "none" : "1px solid rgba(165, 139, 217, 0.15)",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        maxWidth,
        overflow: "hidden",
        position: "relative",
        width: "100%",
      }}
    >
      {!borderless && (
        <Box
          style={{
            background: "linear-gradient(90deg, #4B2E83, #A58BD9, #C4B1E8)",
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
