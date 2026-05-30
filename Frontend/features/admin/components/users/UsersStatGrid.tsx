import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import { CheckCircledIcon, LockClosedIcon, PersonIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { usersPanelStyle } from "@/features/admin/styles/usersTheme";

export function UsersStatGrid({ active, banned, total }: { active: number; banned: number; total: number }) {
  return (
    <Grid columns={{ initial: "1", sm: "3" }} gap="3">
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
  const color = tone === "green" ? "#16A34A" : tone === "red" ? "#DC2626" : authTheme.control;

  return (
    <Box style={{ ...usersPanelStyle, padding: 14 }}>
      <Flex align="center" justify="between" gap="3">
        <Box>
          <Text as="div" size="2" style={{ color: authTheme.muted }}>
            {label}
          </Text>
          <Text as="div" size="7" weight="bold" style={{ color: authTheme.text, lineHeight: 1.1 }}>
            {value}
          </Text>
        </Box>
        <Flex
          align="center"
          justify="center"
          style={{
            background: `${color}16`,
            border: `1px solid ${color}22`,
            borderRadius: 8,
            color,
            height: 44,
            width: 44,
          }}
        >
          {icon}
        </Flex>
      </Flex>
    </Box>
  );
}
