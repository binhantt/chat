import { Box, Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";
import { adminPanelStyle } from "@/features/admin/styles/dashboardTheme";
import type { AdminStatItem } from "./types";

export function AdminStatCard({ icon, label, value }: AdminStatItem) {
  return (
    <Box style={adminPanelStyle}>
      <Flex align="center" gap="3">
        <Flex
          align="center"
          justify="center"
          style={{
            background: `linear-gradient(135deg, ${authTheme.control}, ${authTheme.cyan})`,
            borderRadius: 8,
            color: "#FFFFFF",
            height: 46,
            width: 46,
          }}
        >
          {icon}
        </Flex>
        <Box>
          <Text as="div" size="1" style={{ color: authTheme.muted }}>
            {label}
          </Text>
          <Text as="div" size="7" weight="bold" style={{ color: authTheme.text }}>
            {value}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
