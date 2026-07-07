"use client";

import Link from "next/link";
import { Badge, Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminDashboardHeader() {
  const s = useAdminStyles();

  return (
    <Flex
      align={{ initial: "start", md: "center" }}
      direction={{ initial: "column", md: "row" }}
      gap="4"
      justify="between"
      className={s.dashboard.headerCard}
    >
      <Box>
        <Badge size="3" className={s.dashboard.badge}>
          Bảng quản trị
        </Badge>
        <Heading as="h1" size="7" className={s.dashboard.heading}>
          Tổng quan hệ thống
        </Heading>
        <Text as="p" size="3" className={s.dashboard.subtitle}>
          Theo dõi người dùng, trạng thái tài khoản và các tác vụ quản trị nhanh.
        </Text>
      </Box>
      <Button asChild size="3" variant="soft" className={s.dashboard.refreshBtn}>
        <Link href="/admin">
          <ReloadIcon />
          Làm mới
        </Link>
      </Button>
    </Flex>
  );
}
