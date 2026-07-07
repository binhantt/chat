"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import type { AdminStatItem } from "./types";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminStatCard({ icon, label, value }: AdminStatItem) {
  const s = useAdminStyles();

  return (
    <Box className={s.dashboard.statCard}>
      <Flex align="center" gap="3">
        <Flex align="center" justify="center" className={s.dashboard.statIconBox}>
          {icon}
        </Flex>
        <Box>
          <Text as="div" size="1" className={s.dashboard.statLabel}>
            {label}
          </Text>
          <Text as="div" size="7" weight="bold" className={s.dashboard.statValue}>
            {value}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
