import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import { CheckCircledIcon, LockClosedIcon, StopIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function ConductStatGrid({
  active,
  inactive,
  total,
}: {
  active: number;
  inactive: number;
  total: number;
}) {
  return (
    <Grid columns={{ initial: "1", sm: "3" }} gap="3">
      <ConductStatCard icon={<LockClosedIcon />} label="Tổng luật" value={total} />
      <ConductStatCard icon={<CheckCircledIcon />} label="Đang bật" tone="green" value={active} />
      <ConductStatCard icon={<StopIcon />} label="Đang tắt" tone="gray" value={inactive} />
    </Grid>
  );
}

function ConductStatCard({
  icon,
  label,
  tone = "blue",
  value,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "blue" | "gray" | "green";
  value: number;
}) {
  const s = useAdminStyles();
  const color = tone === "green" ? "#22C55E" : tone === "gray" ? "#64748B" : "var(--primary)";

  return (
    <Box className={s.conduct.statCard}>
      <Flex align="center" gap="3" justify="between">
        <Box>
          <Text as="div" size="1" className={s.conduct.statLabel}>
            {label}
          </Text>
          <Text as="div" size="6" weight="bold" className={s.conduct.statValue}>
            {value}
          </Text>
        </Box>
        <Flex
          align="center"
          justify="center"
          className={s.conduct.statIcon}
          style={{ background: `${color}18`, color }}
        >
          {icon}
        </Flex>
      </Flex>
    </Box>
  );
}
