"use client";

import { Badge, Flex, Text, TextField, Switch, Button } from "@radix-ui/themes";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export function SettingsForm() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const isDark = theme === "dark";
  const readonlyFieldStyle = {
    background: isDark ? "#111827" : "var(--gray-2)",
    color: isDark ? "#e5e7eb" : "var(--gray-12)",
    border: `1px solid ${isDark ? "#334155" : "var(--gray-5)"}`,
    cursor: "not-allowed",
  };

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xoá tài khoản và toàn bộ dữ liệu liên quan không?",
    );
    if (!confirmed) return;

    const typed = window.prompt("Nhập XOA để xác nhận xoá vĩnh viễn tài khoản");
    if (typed !== "XOA") return;

    setDeleting(true);
    try {
      const response = await fetch("/api/auth/me", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        window.alert(error?.message || "Không thể xoá tài khoản");
        return;
      }

      window.location.href = "/login";
    } catch {
      window.alert("Không thể xoá tài khoản");
    } finally {
      setDeleting(false);
    }
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
          style={readonlyFieldStyle}
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
          style={readonlyFieldStyle}
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
          style={readonlyFieldStyle}
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
          style={readonlyFieldStyle}
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
          style={readonlyFieldStyle}
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
          style={readonlyFieldStyle}
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

      <Flex
        direction="column"
        gap="3"
        p="3"
        style={{
          border: "1px solid var(--amber-6)",
          background: isDark ? "rgba(120, 53, 15, 0.2)" : "var(--amber-2)",
        }}
      >
        <Flex justify="between" align="center" gap="2">
          <Flex direction="column" gap="1">
            <Text size="2" weight="bold" color="amber">
              Gói VIP
            </Text>
            <Text size="2" color="gray">
              Mở thêm quyền nâng cao cho tài khoản.
            </Text>
          </Flex>
          <Badge color="amber" variant="soft">Chưa phát triển</Badge>
        </Flex>

        {[
          "Giữ được hình ảnh",
          "Xem được họ và tên người chat",
          "Đổi được giao diện",
        ].map((benefit) => (
          <Flex key={benefit} align="center" justify="between" gap="3">
            <Text size="2">{benefit}</Text>
            <Badge color="gray" variant="soft">Chưa phát triển</Badge>
          </Flex>
        ))}

        <Flex gap="2" wrap="wrap">
          <Button size="2" variant="soft" disabled>VIP 1 tuần</Button>
          <Button size="2" variant="soft" disabled>VIP 15 ngày</Button>
          <Button size="2" variant="soft" disabled>VIP 1 tháng</Button>
        </Flex>
      </Flex>

      <Button size="3" variant="outline" color="red" onClick={handleLogout}>
        Đăng xuất
      </Button>

      <Flex
        direction="column"
        gap="2"
        p="3"
        style={{
          border: "1px solid var(--red-6)",
          background: isDark ? "rgba(127, 29, 29, 0.18)" : "var(--red-2)",
        }}
      >
        <Text size="2" weight="bold" color="red">
          Xoá tài khoản
        </Text>
        <Text size="2" color="gray">
          Xoá tài khoản, hồ sơ, tin nhắn, lịch sử ghép đôi và báo cáo liên quan.
        </Text>
        <Button
          size="3"
          color="red"
          variant="solid"
          onClick={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? "Đang xoá..." : "Xoá tài khoản vĩnh viễn"}
        </Button>
      </Flex>
    </Flex>
  );
}
