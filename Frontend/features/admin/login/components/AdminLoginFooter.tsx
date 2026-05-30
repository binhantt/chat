import { Flex, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { authTheme } from "@/features/athu/styles/authTheme";

export function AdminLoginFooter() {
  return (
    <Flex align="center" direction="column" gap="3">
      <Flex align="center" gap="2" style={{ color: authTheme.muted }}>
        <InfoCircledIcon height={15} width={15} />
        <Text size="1">Truy cập trái phép sẽ bị ghi log.</Text>
      </Flex>
      <Text size="2" style={{ color: authTheme.muted }}>
        Quay lại trang{" "}
        <Link href="/login" style={{ color: authTheme.control, fontWeight: 700, textDecoration: "none" }}>
          người dùng
        </Link>
      </Text>
    </Flex>
  );
}
