"use client";

import {
  Flex,
  Text,
  Box,
  Card,
  Heading,
  TextField,
  Button,
  Switch,
  Select,
  Separator,
  Badge,
  Callout,
} from "@radix-ui/themes";
import {
  GearIcon,
  BellIcon,
  LockClosedIcon,
  RowsIcon,
  EnvelopeClosedIcon,
  GlobeIcon,
  SunIcon,
  MoonIcon,
  ReloadIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";

interface SettingSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SettingSection({ title, description, icon, children }: SettingSectionProps) {
  return (
    <Card size="2">
      <Flex gap="4">
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "var(--indigo-3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--indigo-9)",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Flex direction="column" gap="4" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Heading size="4">{title}</Heading>
            <Text size="2" color="gray">{description}</Text>
          </Flex>
          {children}
        </Flex>
      </Flex>
    </Card>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ label, description, checked, onCheckedChange, disabled }: ToggleRowProps) {
  return (
    <Flex justify="between" align="center" py="2">
      <Flex direction="column" gap="0">
        <Text size="2" weight="medium">{label}</Text>
        <Text size="1" color="gray">{description}</Text>
      </Flex>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </Flex>
  );
}

interface InputRowProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "number" | "password" | "search" | "tel" | "url" | "date";
  placeholder?: string;
}

function InputRow({ label, description, value, onChange, type = "text", placeholder }: InputRowProps) {
  return (
    <Flex direction="column" gap="2" py="2">
      <Flex justify="between" align="center">
        <Text size="2" weight="medium">{label}</Text>
      </Flex>
      <Text size="1" color="gray" mb="1">{description}</Text>
      <TextField.Root value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type}>
        <TextField.Slot />
      </TextField.Root>
    </Flex>
  );
}

function SelectRow({
  label,
  description,
  value,
  onValueChange,
  options,
}: {
  label: string;
  description: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Flex direction="column" gap="2" py="2">
      <Text size="2" weight="medium">{label}</Text>
      <Text size="1" color="gray" mb="1">{description}</Text>
      <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger style={{ maxWidth: 280 }} />
        <Select.Content>
          {options.map((opt) => (
            <Select.Item key={opt.value} value={opt.value}>
              {opt.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <Badge color={color as any} variant="soft" size="1">
      {label}
    </Badge>
  );
}

export function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // General settings
  const [siteName, setSiteName] = useState("ChatApp");
  const [siteEmail, setSiteEmail] = useState("admin@chatapp.com");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [language, setLanguage] = useState("vi");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [newUserAlerts, setNewUserAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Security settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("24h");
  const [ipWhitelist, setIpWhitelist] = useState("");

  // System settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [maxUsers, setMaxUsers] = useState("10000");
  const [maxChats, setMaxChats] = useState("50000");

  // Appearance
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Flex direction="column" gap="5">
      <Flex justify="between" align="center">
        <Heading size="6">Cài đặt</Heading>
        <Flex align="center" gap="2">
          {saved && (
            <Flex align="center" gap="1">
              <CheckIcon width={14} height={14} color="var(--green-9)" />
              <Text size="2" color="green">Đã lưu</Text>
            </Flex>
          )}
          <Button variant="solid" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <ReloadIcon width={14} height={14} style={{ animation: "spin 1s linear infinite" }} />
                Đang lưu...
              </>
            ) : (
              <>
                <CheckIcon width={14} height={14} />
                Lưu thay đổi
              </>
            )}
          </Button>
        </Flex>
      </Flex>

      {/* Appearance */}
      <SettingSection
        title="Giao diện"
        description="Tùy chỉnh giao diện hiển thị"
        icon={<SunIcon width={24} height={24} />}
      >
        <Flex gap="3" wrap="wrap">
          <ToggleRow
            label="Chế độ tối"
            description="Bật chế độ tối cho toàn bộ giao diện"
            checked={darkMode}
            onCheckedChange={setDarkMode}
          />
          <ToggleRow
            label="Chế độ thu gọn"
            description="Hiển thị thông tin chi tiết"
            checked={compactMode}
            onCheckedChange={setCompactMode}
          />
        </Flex>
      </SettingSection>

      {/* General Settings */}
      <SettingSection
        title="Cài đặt chung"
        description="Cấu hình thông tin cơ bản của hệ thống"
        icon={<GearIcon width={24} height={24} />}
      >
        <Flex direction="column" gap="3">
          <InputRow
            label="Tên trang"
            description="Tên hiển thị của ứng dụng"
            value={siteName}
            onChange={setSiteName}
            placeholder="ChatApp"
          />
          <InputRow
            label="Email quản trị"
            description="Email nhận thông báo từ hệ thống"
            value={siteEmail}
            onChange={setSiteEmail}
            type="email"
            placeholder="admin@example.com"
          />
          <SelectRow
            label="Múi giờ"
            description="Múi giờ mặc định cho hệ thống"
            value={timezone}
            onValueChange={setTimezone}
            options={[
              { value: "Asia/Ho_Chi_Minh", label: "Hồ Chí Minh (UTC+7)" },
              { value: "Asia/Bangkok", label: "Bangkok (UTC+7)" },
              { value: "Asia/Singapore", label: "Singapore (UTC+8)" },
              { value: "UTC", label: "UTC" },
            ]}
          />
          <SelectRow
            label="Ngôn ngữ"
            description="Ngôn ngữ mặc định cho giao diện"
            value={language}
            onValueChange={setLanguage}
            options={[
              { value: "vi", label: "Tiếng Việt" },
              { value: "en", label: "English" },
              { value: "zh", label: "中文" },
            ]}
          />
        </Flex>
      </SettingSection>

      {/* Notifications */}
      <SettingSection
        title="Thông báo"
        description="Cấu hình các kênh thông báo"
        icon={<BellIcon width={24} height={24} />}
      >
        <Flex direction="column" gap="2">
          <ToggleRow
            label="Email thông báo"
            description="Gửi email khi có sự kiện quan trọng"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
          <ToggleRow
            label="Push notification"
            description="Thông báo đẩy trên trình duyệt"
            checked={pushNotifications}
            onCheckedChange={setPushNotifications}
          />
          <ToggleRow
            label="Bản tin hàng tuần"
            description="Nhận bản tin tóm tắt hoạt động hàng tuần"
            checked={weeklyDigest}
            onCheckedChange={setWeeklyDigest}
          />
          <Separator my="2" />
          <ToggleRow
            label="Cảnh báo người dùng mới"
            description="Thông báo khi có người dùng mới đăng ký"
            checked={newUserAlerts}
            onCheckedChange={setNewUserAlerts}
          />
          <ToggleRow
            label="Cảnh báo hệ thống"
            description="Thông báo lỗi và cảnh báo server"
            checked={systemAlerts}
            onCheckedChange={setSystemAlerts}
          />
        </Flex>
      </SettingSection>

      {/* Security */}
      <SettingSection
        title="Bảo mật"
        description="Cấu hình bảo mật và truy cập"
        icon={<LockClosedIcon width={24} height={24} />}
      >
        <Flex direction="column" gap="3">
          <ToggleRow
            label="Xác thực 2 lớp (2FA)"
            description="Yêu cầu mã xác thực khi đăng nhập"
            checked={twoFactorAuth}
            onCheckedChange={setTwoFactorAuth}
          />
          <SelectRow
            label="Thời gian hết phiên"
            description="Tự động đăng xuất sau thời gian không hoạt động"
            value={sessionTimeout}
            onValueChange={setSessionTimeout}
            options={[
              { value: "1h", label: "1 giờ" },
              { value: "6h", label: "6 giờ" },
              { value: "12h", label: "12 giờ" },
              { value: "24h", label: "24 giờ" },
              { value: "7d", label: "7 ngày" },
            ]}
          />
          <InputRow
            label="Danh sách IP cho phép"
            description="Chỉ cho phép truy cập từ các IP này (để trống để cho phép tất cả)"
            value={ipWhitelist}
            onChange={setIpWhitelist}
            placeholder="192.168.1.1, 10.0.0.1"
          />
        </Flex>
      </SettingSection>

      {/* System */}
      <SettingSection
        title="Hệ thống"
        description="Cấu hình hoạt động và giới hạn"
        icon={<GearIcon width={24} height={24} />}
      >
        <Flex direction="column" gap="3">
          <ToggleRow
            label="Chế độ bảo trì"
            description="Chặn người dùng thường truy cập hệ thống"
            checked={maintenanceMode}
            onCheckedChange={setMaintenanceMode}
          />
          {maintenanceMode && (
            <Callout.Root color="amber">
              <Callout.Text>Hệ thống đang trong chế độ bảo trì. Người dùng không thể đăng nhập.</Callout.Text>
            </Callout.Root>
          )}
          <ToggleRow
            label="Chế độ debug"
            description="Hiển thị thông tin debug cho developer"
            checked={debugMode}
            onCheckedChange={setDebugMode}
          />
          <InputRow
            label="Số người dùng tối đa"
            description="Giới hạn số lượng tài khoản đăng ký"
            value={maxUsers}
            onChange={setMaxUsers}
            type="number"
            placeholder="10000"
          />
          <InputRow
            label="Số cuộc trò chuyện tối đa"
            description="Giới hạn tổng số cuộc trò chuyện"
            value={maxChats}
            onChange={setMaxChats}
            type="number"
            placeholder="50000"
          />
        </Flex>
      </SettingSection>

      {/* System Status */}
      <Card size="2">
        <Flex direction="column" gap="4">
          <Heading size="4">Trạng thái hệ thống</Heading>
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">Phiên bản</Text>
              <Text size="3" weight="medium">v1.2.3</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">Trạng thái</Text>
              <Flex align="center" gap="2">
                <Box
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--green-9)",
                  }}
                />
                <Text size="3" weight="medium" color="green">Hoạt động</Text>
              </Flex>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">Uptime</Text>
              <Text size="3" weight="medium">99.8%</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">Lần deploy gần nhất</Text>
              <Text size="3" weight="medium">2 ngày trước</Text>
            </Flex>
          </Box>
        </Flex>
      </Card>
    </Flex>
  );
}