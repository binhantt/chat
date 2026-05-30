import { Box, Flex, Text } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { authTheme } from "@/features/athu/styles/authTheme";
import { AdminCurrentUser } from "./AdminCurrentUser";
import { AdminLogoutButton } from "./AdminLogoutButton";

export function AdminNavbar() {
  return (
    <Flex
      align="center"
      justify="between"
      style={{
        background: authTheme.panel,
        borderBottom: `1px solid ${authTheme.line}`,
        flexShrink: 0,
        gap: 12,
        minHeight: 64,
        padding: "10px clamp(12px, 2vw, 20px)",
      }}
    >
      <Box display={{ initial: "block", md: "none" }}>
        <BrandLogo compact subtitle="Bảng quản trị" />
      </Box>

      <Flex
        align="center"
        gap="2"
        display={{ initial: "none", md: "flex" }}
        style={{
          background: "var(--auth-soft-control)",
          border: `1px solid ${authTheme.line}`,
          borderRadius: 8,
          color: authTheme.muted,
          height: 40,
          maxWidth: 420,
          paddingInline: 12,
          width: "42%",
        }}
      >
        <MagnifyingGlassIcon />
        <Text size="2">Tìm kiếm quản trị...</Text>
      </Flex>

      <Flex align="center" gap={{ initial: "2", sm: "3" }} style={{ marginLeft: "auto" }}>
        <AdminCurrentUser />
        <AdminLogoutButton />
      </Flex>
    </Flex>
  );
}
