"use client";

import { Flex, Text, TextField, Switch, Button } from "@radix-ui/themes";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export function SettingsForm() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const isDark = theme === "dark";

  const handleLogout = () => {
    logout();
  };

  return (
    <Flex direction="column" gap="5" style={{ maxWidth: 480, width: "100%" }}>
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Tên hiển thị
        </Text>
        <TextField.Root
          placeholder="Nhập tên hiển thị"
          defaultValue={user?.fullName || ""}
          readOnly
          style={{ background: isDark ? "var(--gray-11)" : "var(--gray-2)", color: isDark ? "var(--gray-1)" : "var(--gray-12)", cursor: "not-allowed" }}
        />
      </Flex>

      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Email
        </Text>
        <TextField.Root
          placeholder="Nhập email"
          defaultValue={user?.email || ""}
          readOnly
          style={{ background: isDark ? "var(--gray-11)" : "var(--gray-2)", color: isDark ? "var(--gray-1)" : "var(--gray-12)", cursor: "not-allowed" }}
        />
      </Flex>

      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Số điện thoại
        </Text>
        <TextField.Root
          placeholder="Chưa cập nhật"
          defaultValue={user?.phoneNumber || ""}
          readOnly
          style={{ background: isDark ? "var(--gray-11)" : "var(--gray-2)", color: isDark ? "var(--gray-1)" : "var(--gray-12)", cursor: "not-allowed" }}
        />
      </Flex>

      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Thành phố
        </Text>
        <TextField.Root
          placeholder="Chưa cập nhật"
          defaultValue={user?.city || ""}
          readOnly
          style={{ background: isDark ? "var(--gray-11)" : "var(--gray-2)", color: isDark ? "var(--gray-1)" : "var(--gray-12)", cursor: "not-allowed" }}
        />
      </Flex>

      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Giới tính
        </Text>
        <TextField.Root
          placeholder="Chưa cập nhật"
          defaultValue={user?.gender === "male" ? "Nam" : user?.gender === "female" ? "Nữ" : user?.gender === "other" ? "Khác" : ""}
          readOnly
          style={{ background: isDark ? "var(--gray-11)" : "var(--gray-2)", color: isDark ? "var(--gray-1)" : "var(--gray-12)", cursor: "not-allowed" }}
        />
      </Flex>

      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Giới thiệu bản thân
        </Text>
        <TextField.Root
          placeholder="Chưa cập nhật"
          defaultValue={user?.bio || ""}
          readOnly
          style={{ background: isDark ? "var(--gray-11)" : "var(--gray-2)", color: isDark ? "var(--gray-1)" : "var(--gray-12)", cursor: "not-allowed" }}
        />
      </Flex>

      <Flex direction="column" gap="3">
        <Flex align="center" justify="between">
          <Flex direction="column" gap="0">
            <Text size="2" weight="medium">Nhận thông báo</Text>
            <Text size="1" color="gray">Nhận thông báo khi có tin nhắn mới</Text>
          </Flex>
          <Switch defaultChecked color="indigo" />
        </Flex>

        <Flex align="center" justify="between">
          <Flex direction="column" gap="0">
            <Text size="2" weight="medium">Chế độ tối</Text>
            <Text size="1" color="gray">Bật giao diện tối</Text>
          </Flex>
          <Switch checked={isDark} onCheckedChange={toggleTheme} color="indigo" />
        </Flex>

        <Flex align="center" justify="between">
          <Flex direction="column" gap="0">
            <Text size="2" weight="medium">Âm thanh</Text>
            <Text size="1" color="gray">Phát âm thanh khi nhận tin nhắn</Text>
          </Flex>
          <Switch defaultChecked color="indigo" />
        </Flex>
      </Flex>

      <Button size="3" color="indigo" disabled>
        Lưu cài đặt
      </Button>

      <Button size="3" variant="outline" color="red" onClick={handleLogout}>
        Đăng xuất
      </Button>
    </Flex>
  );
}
