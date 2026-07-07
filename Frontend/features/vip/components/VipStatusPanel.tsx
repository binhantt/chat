import { Flex, Text } from "@radix-ui/themes";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { UserPanel } from "@/features/user-layout/components";

export function VipStatusPanel() {
  return (
    <UserPanel maxWidth={340}>
      <Flex direction="column" gap="2">
        <Flex align="center" gap="2">
          <LockClosedIcon color="#f59e0b" />
          <Text size="2" weight="bold" style={{ color: "var(--text-primary)" }}>
            Quyền lợi đang hoàn thiện
          </Text>
        </Flex>
        <Text size="2" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Nút thanh toán sẽ được mở khi hệ thống mua gói hoàn tất.
        </Text>
      </Flex>
    </UserPanel>
  );
}
