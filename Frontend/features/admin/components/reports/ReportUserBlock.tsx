import { Avatar, Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";
import { displayReportUser, getReportInitials } from "./reportUtils";

export function ReportUserBlock({
  color = "indigo",
  user,
}: {
  color?: "indigo" | "red";
  user: { email: string; fullName: string | null };
}) {
  return (
    <Flex
      align="center"
      gap="2"
      style={{
        background: color === "red" ? "rgba(239,68,68,0.06)" : "rgba(59,130,246,0.06)",
        borderRadius: 8,
        minWidth: 0,
        padding: "8px 10px",
      }}
    >
      <Avatar color={color} fallback={getReportInitials(user)} radius="full" size="2" />
      <Flex direction="column" style={{ minWidth: 0 }}>
        <Text as="div" size="2" weight="bold" style={{ color: authTheme.text, overflow: "hidden", textOverflow: "ellipsis" }}>
          {displayReportUser(user)}
        </Text>
        <Text as="div" size="1" style={{ color: authTheme.muted, overflow: "hidden", textOverflow: "ellipsis" }}>
          {user.email}
        </Text>
      </Flex>
    </Flex>
  );
}
