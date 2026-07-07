"use client";

import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminLoginCopy() {
  const s = useAdminStyles();
  return (
    <Flex align="center" direction="column" gap="3" className={s.loginCopy.loginCopySection}>
      <Flex
        align="center"
        justify="center"
        className={s.loginCopy.loginIconBox}
      >
        <LockClosedIcon height={24} width={24} />
      </Flex>
      <Box>
        <Text size="2" weight="medium" className={s.loginCopy.loginBadge}>
          Bảng quản trị
        </Text>
        <Heading as="h1" size="6" className={s.loginCopy.loginHeading}>
          Đăng nhập quản trị
        </Heading>
      </Box>
      <Text size="2" className={s.loginCopy.loginDescription}>
        Chỉ dành cho tài khoản được cấp quyền quản trị hệ thống.
      </Text>
    </Flex>
  );
}
