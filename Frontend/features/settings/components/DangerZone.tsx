"use client";

import { Button, Flex, Text } from "@radix-ui/themes";
import { ExitIcon, TrashIcon } from "@radix-ui/react-icons";
import { SettingsSection } from "./SettingsSection";

type DangerZoneProps = {
  deleting: boolean;
  onDeleteAccount: () => void;
  onLogout: () => void;
};

export function DangerZone({ deleting, onDeleteAccount, onLogout }: DangerZoneProps) {
  return (
    <SettingsSection
      description="Đăng xuất hoặc xóa vĩnh viễn tài khoản."
      icon={<TrashIcon />}
      title="Vùng nguy hiểm"
    >
      <Flex direction={{ initial: "column", sm: "row" }} gap="3">
        <Button
          size="3"
          variant="outline"
          onClick={onLogout}
          style={{
            borderColor: "var(--chat-border)",
            borderRadius: 8,
            flex: 1,
          }}
        >
          <ExitIcon />
          Đăng xuất
        </Button>
        <Button
          color="red"
          disabled={deleting}
          onClick={onDeleteAccount}
          size="3"
          style={{ borderRadius: 8, flex: 1 }}
        >
          <TrashIcon />
          {deleting ? "Đang xóa..." : "Xóa tài khoản"}
        </Button>
      </Flex>
      <Text size="1" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
        Khi xóa tài khoản, hồ sơ, tin nhắn, lịch sử ghép đôi và báo cáo liên quan sẽ bị xóa.
      </Text>
    </SettingsSection>
  );
}
