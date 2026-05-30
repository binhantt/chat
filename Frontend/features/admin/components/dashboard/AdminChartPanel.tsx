import { Box, Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";
import { adminPanelStyle } from "@/features/admin/styles/dashboardTheme";
import type { AdminDashboardStats } from "./types";

export function AdminChartPanel({ stats }: { stats: AdminDashboardStats }) {
  const activePct = getPercent(stats.active, stats.total);
  const bannedPct = getPercent(stats.banned, stats.total);

  return (
    <Box style={adminPanelStyle}>
      <Flex direction="column" gap="4">
        <Box>
          <Text as="div" size="4" weight="bold" style={{ color: authTheme.text }}>
            Sơ đồ tài khoản
          </Text>
          <Text as="div" size="2" style={{ color: authTheme.muted, marginTop: 4 }}>
            Phân bố trạng thái hiện tại trong hệ thống.
          </Text>
        </Box>

        <Flex align="center" gap="4" wrap="wrap">
          <Flex
            align="center"
            justify="center"
            style={{
              background: `conic-gradient(${authTheme.control} 0 ${activePct}%, #EF4444 ${activePct}% ${
                activePct + bannedPct
              }%, rgba(59,130,246,0.12) 0)`,
              borderRadius: "50%",
              height: 148,
              minWidth: 148,
              width: 148,
            }}
          >
            <Flex
              align="center"
              direction="column"
              justify="center"
              style={{
                background: authTheme.panel,
                borderRadius: "50%",
                height: 104,
                width: 104,
              }}
            >
              <Text size="7" weight="bold" style={{ color: authTheme.text }}>
                {stats.total}
              </Text>
              <Text size="1" style={{ color: authTheme.muted }}>
                tổng
              </Text>
            </Flex>
          </Flex>

          <Flex direction="column" gap="3" style={{ flex: 1, minWidth: 220 }}>
            <ChartLegend color={authTheme.control} label="Hoạt động" percent={activePct} value={stats.active} />
            <ChartLegend color="#EF4444" label="Đã khóa" percent={bannedPct} value={stats.banned} />
          </Flex>
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
  return (
    <Box>
      <Flex align="center" gap="2" justify="between">
        <Flex align="center" gap="2">
          <Box style={{ background: color, borderRadius: 999, height: 10, width: 10 }} />
          <Text size="2" weight="medium" style={{ color: authTheme.text }}>
            {label}
          </Text>
        </Flex>
        <Text size="2" style={{ color: authTheme.muted }}>
          {value} / {percent}%
        </Text>
      </Flex>
      <Box style={{ background: "rgba(59,130,246,0.1)", borderRadius: 999, height: 6, marginTop: 7, overflow: "hidden" }}>
        <Box style={{ background: color, borderRadius: 999, height: "100%", width: `${percent}%` }} />
      </Box>
    </Box>
  );
}

function getPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}
