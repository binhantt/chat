"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminProgressRow({
  label,
  tone = "blue",
  total,
  value,
}: {
  label: string;
  tone?: "blue" | "cyan" | "red";
  total: number;
  value: number;
}) {
  const s = useAdminStyles();
  const width = total > 0 ? Math.round((value / total) * 100) : 0;
  const color = tone === "red" ? "#EF4444" : tone === "cyan" ? "#22d3ee" : "var(--primary)";

  return (
    <Box>
      <Flex align="center" justify="between" mb="1">
        <Text size="2" weight="medium" className={s.dashboard.progressRowLabel}>
          {label}
        </Text>
        <Text size="2" className={s.dashboard.progressRowValue}>
          {value}
        </Text>
      </Flex>
      <Box className={s.dashboard.progressBar}>
        <Box className={s.dashboard.progressBarFill} style={{ background: color, width: `${width}%` }} />
      </Box>
    </Box>
  );
}
