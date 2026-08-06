import { Avatar, Box } from "@radix-ui/themes";
import type { AvatarProps } from "@radix-ui/themes";

interface AvatarWithVipBadgeProps extends AvatarProps {
  badge?: string | null;
}

/**
 * Wraps Radix UI Avatar with a VIP golden frame + crown badge overlay.
 * When `badge` is truthy:
 *   - A golden gradient ring wraps the avatar (khung VIP)
 *   - A crown icon appears at the bottom-right corner
 */
export function AvatarWithVipBadge({ badge, style, ...props }: AvatarWithVipBadgeProps) {
  const hasBadge = !!badge;

  const frameStyle = hasBadge
    ? {
        ...(style as React.CSSProperties | undefined),
        boxShadow: `
          0 0 0 2px #FFD700,
          0 0 0 4px #FFA500,
          0 0 0 6px rgba(255, 215, 0, 0.15),
          0 0 20px rgba(255, 215, 0, 0.25)
        `,
        transition: "box-shadow 0.2s ease",
      }
    : style;

  return (
    <Box style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <Avatar style={frameStyle} {...props} />
      {hasBadge && (
        <Box
          style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            lineHeight: 1,
            boxShadow: `
              0 2px 8px rgba(255, 165, 0, 0.45),
              0 0 0 2px rgba(255, 255, 255, 0.95)
            `,
            zIndex: 1,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          👑
        </Box>
      )}
    </Box>
  );
}
