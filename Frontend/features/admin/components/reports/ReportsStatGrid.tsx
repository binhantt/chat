import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import { CheckCircledIcon, CrossCircledIcon, ExclamationTriangleIcon, FileTextIcon } from "@radix-ui/react-icons";
import type { ReportStatsValue } from "./types";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

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
  const s = useAdminStyles();
  const color =
    tone === "green" ? "#22C55E" : tone === "red" ? "#EF4444" : tone === "amber" ? "#F59E0B" : "var(--primary)";

  return (
    <Box className={s.reports.statCard}>
      <Flex align="center" gap="3" justify="between">
        <Box>
          <Text as="div" size="1" className={s.reports.statLabel}>
            {label}
          </Text>
          <Text as="div" size="6" weight="bold" className={s.reports.statValue}>
            {value}
          </Text>
        </Box>
        <Flex
          align="center"
          justify="center"
          className={s.reports.statIconBox}
          style={{
            background: `${color}18`,
            color,
          }}
        >
          {icon}
        </Flex>
      </Flex>
    </Box>
  );
}
