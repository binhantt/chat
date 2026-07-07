"use client";

import { Flex, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminLoginFooter() {
  const s = useAdminStyles();
  return (
    <Flex align="center" direction="column" gap="3">
      <Flex align="center" gap="2" className={s.loginFooter.footerSection}>
        <InfoCircledIcon height={15} width={15} />
        <Text size="1">Truy cập trái phép sẽ bị ghi log.</Text>
      </Flex>
      <Text size="2" className={s.loginFooter.footerSection}>
        Quay lại trang{" "}
        <Link href="/login" className={s.loginFooter.footerLink}>
          người dùng
        </Link>
      </Text>
    </Flex>
  );
}
