import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import { CheckCircledIcon, LockClosedIcon, StopIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { conductInnerBorder } from "@/features/admin/styles/conductTheme";

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
  const color = tone === "green" ? "#22C55E" : tone === "gray" ? "#64748B" : authTheme.control;

  return (
    <Box
      style={{
        background: authTheme.panel,
        border: conductInnerBorder,
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
