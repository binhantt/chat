"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import { AdminProgressRow } from "./AdminProgressRow";
import type { AdminDashboardStats } from "./types";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminChartPanel({ stats }: { stats: AdminDashboardStats }) {
  const s = useAdminStyles();
  const activePct = getPercent(stats.active, stats.total);
  const bannedPct = getPercent(stats.banned, stats.total);

  return (
    <Box className={s.dashboard.chartPanel}>
      <Flex direction="column" gap="4">
        <Box>
          <Text as="div" size="4" weight="bold" className={s.dashboard.chartTitle}>
            Sơ đồ tài khoản
          </Text>
          <Text as="div" size="2" className={s.dashboard.chartDesc}>
            Gộp biểu đồ và trạng thái tài khoản trong một khung.
          </Text>
        </Box>

        <Flex align="center" gap="4" wrap="wrap">
          <Flex
            align="center"
            justify="center"
            style={{
              background: `conic-gradient(var(--primary) 0 ${activePct}%, #EF4444 ${activePct}% ${
                activePct + bannedPct
              }%, rgba(75,46,131,0.12) 0)`,
              borderRadius: "50%",
              height: 148,
              minWidth: 148,
              width: 148,
            }}
          >
            <Flex align="center" direction="column" justify="center" className={s.dashboard.chartDonutCenter}>
              <Text size="7" weight="bold" className={s.dashboard.chartDonutCenterTotal}>
                {stats.total}
              </Text>
              <Text size="1" className={s.dashboard.chartDonutCenterLabel}>
                tổng
              </Text>
            </Flex>
          </Flex>

          <Flex direction="column" gap="3" style={{ flex: 1, minWidth: 220 }}>
            <ChartLegend color="var(--primary)" label="Hoạt động" percent={activePct} value={stats.active} />
            <ChartLegend color="#EF4444" label="Đã khóa" percent={bannedPct} value={stats.banned} />
          </Flex>
        </Flex>

        <Flex direction="column" gap="3">
          <Text size="2" weight="bold" className={s.dashboard.chartSectionTitle}>
            Trạng thái người dùng
          </Text>
          <AdminProgressRow label="Hoạt động" total={stats.total} value={stats.active} />
          <AdminProgressRow label="Đã khóa" total={stats.total} value={stats.banned} tone="red" />
        </Flex>
      </Flex>
    </Box>
  );
}

function ChartLegend({
  color,
  label,
  percent,
  value,
}: {
  color: string;
  label: string;
  percent: number;
  value: number;
}) {
  const s = useAdminStyles();
  return (
    <Box>
      <Flex align="center" gap="2" justify="between">
        <Flex align="center" gap="2">
          <Box style={{ background: color, borderRadius: 999, height: 10, width: 10 }} />
          <Text size="2" weight="medium" className={s.dashboard.chartTitle}>
            {label}
          </Text>
        </Flex>
        <Text size="2" className={s.dashboard.visitMetricLabel}>
          {value} / {percent}%
        </Text>
      </Flex>
      <Box className={s.dashboard.chartLegendItem}>
        <Box className={s.dashboard.chartLegendFill} style={{ background: color, width: `${percent}%` }} />
      </Box>
    </Box>
  );
}

function getPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}
