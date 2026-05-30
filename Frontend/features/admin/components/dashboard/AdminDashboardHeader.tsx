import Link from "next/link";
import { Badge, Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { adminHeroStyle } from "@/features/admin/styles/dashboardTheme";

export function AdminDashboardHeader() {
  return (
    <Flex
      align={{ initial: "start", md: "center" }}
      direction={{ initial: "column", md: "row" }}
      gap="4"
      justify="between"
      style={adminHeroStyle}
    >
      <Box>
        <Badge
          size="3"
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            border: `1px solid ${authTheme.line}`,
            color: authTheme.text,
            marginBottom: 10,
          }}
        >
          Bảng quản trị
        </Badge>
        <Heading as="h1" size="7" style={{ color: authTheme.text, letterSpacing: 0 }}>
          Tổng quan hệ thống
        </Heading>
        <Text as="p" size="3" style={{ color: authTheme.muted, lineHeight: 1.6, margin: "8px 0 0", maxWidth: 680 }}>
          Theo dõi người dùng, trạng thái tài khoản và các tác vụ quản trị nhanh.
        </Text>
      </Box>
      <Button asChild size="3" variant="soft" style={{ borderRadius: 8 }}>
        <Link href="/admin">
          <ReloadIcon />
          Làm mới
        </Link>
      </Button>
    </Flex>
  );
}
