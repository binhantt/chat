import { Box, Flex, Text } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AdminCurrentUser } from "./AdminCurrentUser";
import { AdminLogoutButton } from "./AdminLogoutButton";
import navbarStyles from "./admin-navbar.module.css";

export function AdminNavbar() {
  return (
    <Flex align="center" justify="between" className={navbarStyles.navbar}>
      <Box className={navbarStyles.mobileLogo}>
        <BrandLogo compact subtitle="Bảng quản trị" />
      </Box>

      <Flex align="center" gap="2" className={navbarStyles.searchBox}>
        <MagnifyingGlassIcon />
        <Text size="2">Tìm kiếm quản trị...</Text>
      </Flex>

      <Flex align="center" gap={{ initial: "2", sm: "3" }} className={navbarStyles.rightSection}>
        <AdminCurrentUser />
        <AdminLogoutButton />
      </Flex>
    </Flex>
  );
}
