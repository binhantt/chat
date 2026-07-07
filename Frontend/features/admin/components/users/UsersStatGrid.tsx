import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import { CheckCircledIcon, LockClosedIcon, PersonIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function UsersStatGrid({
  active,
  banned,
  total,
}: {
  active: number;
  banned: number;
  total: number;
}) {
  const s = useAdminStyles();
  return (
    <Grid columns={{ initial: "2", lg: "3" }} gap="3">
      <UsersStatCard icon={<PersonIcon />} label="Tổng tài khoản" value={total} />
      <UsersStatCard icon={<CheckCircledIcon />} label="Đang hoạt động" value={active} tone="green" />
      <UsersStatCard icon={<LockClosedIcon />} label="Đã khóa" value={banned} tone="red" />
    </Grid>
  );
}

function UsersStatCard({
  icon,
  label,
  tone = "blue",
  value,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "blue" | "green" | "red";
  value: number;
}) {
  const s = useAdminStyles();
  const color =
    tone === "green" ? "#22C55E" : tone === "red" ? "#EF4444" : "var(--primary)";

  return (
    <Box className={s.users.statCard}>
      <Flex align="center" gap="3" justify="between">
        <Box>
          <Text as="div" size="1" className={s.users.statLabel}>
            {label}
          </Text>
          <Text as="div" size="6" weight="bold" className={s.users.statValue}>
            {value}
          </Text>
        </Box>
        <Flex align="center" justify="center" className={s.users.statIconBox} style={{ background: `${color}18`, color }}>
          {icon}
        </Flex>
      </Flex>
    </Box>
  );
}
