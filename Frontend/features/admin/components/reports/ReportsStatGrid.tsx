import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import { CheckCircledIcon, CrossCircledIcon, ExclamationTriangleIcon, FileTextIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { reportsInnerBorder } from "@/features/admin/styles/reportsTheme";
import type { ReportStatsValue } from "./types";

export function ReportsStatGrid({ stats }: { stats: ReportStatsValue }) {
  return (
    <Grid columns={{ initial: "2", lg: "4" }} gap="3">
      <ReportStatCard icon={<FileTextIcon />} label="Tổng báo cáo" value={stats.total} />
      <ReportStatCard icon={<ExclamationTriangleIcon />} label="Chờ xử lý" tone="amber" value={stats.pending} />
      <ReportStatCard icon={<CheckCircledIcon />} label="Vi phạm" tone="green" value={stats.resolved} />
      <ReportStatCard icon={<CrossCircledIcon />} label="Từ chối" tone="red" value={stats.rejected} />
    </Grid>
  );
}

function ReportStatCard({
  icon,
  label,
  tone = "blue",
  value,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "amber" | "blue" | "green" | "red";
  value: number;
}) {
  const color =
    tone === "green" ? "#22C55E" : tone === "red" ? "#EF4444" : tone === "amber" ? "#F59E0B" : authTheme.control;

  return (
    <Box
      style={{
        background: authTheme.panel,
        border: reportsInnerBorder,
        borderRadius: 8,
        padding: 14,
      }}
    >
      <Flex align="center" gap="3" justify="between">
        <Box>
          <Text as="div" size="1" style={{ color: authTheme.muted }}>
            {label}
          </Text>
          <Text as="div" size="6" weight="bold" style={{ color: authTheme.text, lineHeight: 1.15 }}>
            {value}
          </Text>
        </Box>
        <Flex
          align="center"
          justify="center"
          style={{
            background: `${color}18`,
            borderRadius: 8,
            color,
            height: 42,
            width: 42,
          }}
        >
          {icon}
        </Flex>
      </Flex>
    </Box>
  );
}
