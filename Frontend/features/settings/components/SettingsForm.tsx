"use client";

import { Button, Flex, Grid } from "@radix-ui/themes";
import {
  BellIcon,
  EnterIcon,
  IdCardIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { authTheme } from "@/features/athu/styles/authTheme";
import { DangerZone } from "./DangerZone";
import { ReadonlyField } from "./ReadonlyField";
import { SettingsSection } from "./SettingsSection";
import { ToggleRow } from "./ToggleRow";
import { VipSettingsCard } from "./VipSettingsCard";

export function SettingsForm() {
  const { setThemeMode, theme } = useTheme();
  const { user, logout } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const isDark = theme === "dark";

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa tài khoản và toàn bộ dữ liệu liên quan không?",
    );
    if (!confirmed) return;

    const typed = window.prompt("Nhập XOA để xác nhận xóa vĩnh viễn tài khoản");
    if (typed !== "XOA") return;

    setDeleting(true);
    try {
      const response = await fetch("/api/v1/users/me", {
        credentials: "include",
        method: "DELETE",
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { message?: string } | null;
        window.alert(error?.message || "Không thể xóa tài khoản");
        return;
      }

      window.location.href = "/login";
    } catch {
      window.alert("Không thể xóa tài khoản");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Flex direction="column" gap="4" style={{ width: "100%" }}>
      <SettingsSection
        description="Thông tin này đang được đồng bộ từ hồ sơ cá nhân."
        icon={<IdCardIcon />}
        title="Thông tin tài khoản"
      >
        <Grid columns={{ initial: "1", sm: "2" }} gap="3">
          <ReadonlyField label="Tên hiển thị" placeholder="Chưa đặt tên" value={user?.fullName} />
          <ReadonlyField label="Email" value={user?.email} />
          <ReadonlyField label="Số điện thoại" value={user?.phoneNumber} />
          <ReadonlyField label="Thành phố" value={formatCity(user?.city)} />
          <ReadonlyField label="Giới tính" value={formatGender(user?.gender)} />
          <ReadonlyField label="Giới thiệu" value={user?.bio} />
        </Grid>
        <Button
          disabled
          size="3"
          style={{
            background: authTheme.control,
            borderRadius: 8,
            color: "#FFFFFF",
            width: "100%",
          }}
        >
          <EnterIcon />
          Lưu cài đặt
        </Button>
      </SettingsSection>

      <SettingsSection
        description="Những tùy chọn nhanh cho trải nghiệm sử dụng."
        icon={<BellIcon />}
        title="Tùy chọn"
      >
        <Flex direction="column" gap="3">
          <ToggleRow
            defaultChecked
            description="Nhận thông báo khi có tin nhắn mới"
            title="Nhận thông báo"
          />
          <ToggleRow
            checked={isDark}
            description="Bật hoặc tắt giao diện tối"
            onCheckedChange={(checked) => setThemeMode(checked ? "dark" : "light")}
            title="Chế độ tối"
          />
          <ToggleRow
            defaultChecked
            description="Phát âm thanh khi nhận tin nhắn"
            title="Âm thanh"
          />
        </Flex>
      </SettingsSection>

      <VipSettingsCard />

      <DangerZone
        deleting={deleting}
        onDeleteAccount={handleDeleteAccount}
        onLogout={logout}
      />
    </Flex>
  );
}

function formatGender(gender?: string | null) {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";
  if (gender === "other") return "Khác";
  return "";
}

function formatCity(city?: string | null) {
  if (city === "TP. Ho Chi Minh") return "TP. Hồ Chí Minh";
  if (city === "Ha Noi") return "Hà Nội";
  return city || "";
}
