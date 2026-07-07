import { Avatar, Flex, Text } from "@radix-ui/themes";
import { displayReportUser, getReportInitials } from "./reportUtils";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function ReportUserBlock({
  color = "indigo",
  user,
}: {
  color?: "indigo" | "red";
  user: { email: string; fullName: string | null };
}) {
  const s = useAdminStyles();
  return (
    <Flex
      align="center"
      gap="2"
      className={`${s.reports.userBlock} ${color === "red" ? s.reports.userBlockRed : s.reports.userBlockIndigo}`}
    >
      <Avatar color={color} fallback={getReportInitials(user)} radius="full" size="2" />
      <Flex direction="column" className={s.reports.userBlockInner}>
        <Text as="div" size="2" weight="bold" className={s.reports.userBlockName}>
          {displayReportUser(user)}
        </Text>
        <Text as="div" size="1" className={s.reports.userBlockEmail}>
          {user.email}
        </Text>
      </Flex>
    </Flex>
  );
}
