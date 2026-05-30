import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import { CheckCircledIcon, LockClosedIcon, PersonIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { usersInnerBorder } from "@/features/admin/styles/usersTheme";

export function UsersStatGrid({
  active,
  banned,
  total,
}: {
  active: number;
  banned: number;
  total: number;
}) {
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
  const color =
    tone === "green" ? "#22C55E" : tone === "red" ? "#EF4444" : authTheme.control;

  return (
    <Box
      style={{
        background: authTheme.panel,
        border: usersInnerBorder,
        borderRadius: 8,
        padding: 14,
      }}
    >
      <Flex align="center" gap="3" justify="between">
        <Box>
          <Text as="div" size="1" style={{ color: authTheme.muted }}>
            {label}
          </Text>
          <Text
            as="div"
            size="6"
            weight="bold"
            style={{ color: authTheme.text, lineHeight: 1.15 }}
          >
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
