"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Badge, Box, Button, Callout, Flex, Grid, Heading, Select, Separator, Switch, Text, TextField } from "@radix-ui/themes";
import { BellIcon, CheckIcon, GearIcon, LockClosedIcon, ReloadIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

type SettingSectionProps = {
  children: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
};

function SettingSection({ children, description, icon, title }: SettingSectionProps) {
  const s = useAdminStyles();
  return (
    <Flex
      direction="column"
      gap="4"
      className={s.settings.settingSection}
    >
      <Flex align="center" gap="3">
        <Flex
          align="center"
          justify="center"
          className={s.settings.sectionIconBox}
        >
          {icon}
        </Flex>
        <Box>
          <Heading size="4" className={s.settings.sectionTitle}>
            {title}
          </Heading>
          <Text as="p" size="2" className={s.settings.sectionDescription}>
            {description}
          </Text>
        </Box>
      </Flex>
      {children}
    </Flex>
  );
}

function ToggleRow({
  checked,
  description,
  disabled,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  description: string;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  const s = useAdminStyles();
  return (
    <Flex align="center" justify="between" py="2" gap="3">
      <Box>
        <Text as="div" size="2" weight="medium" className={s.settings.toggleLabel}>
          {label}
        </Text>
        <Text as="div" size="1" className={s.settings.toggleDescription}>
          {description}
        </Text>
      </Box>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </Flex>
  );
}

function InputRow({
  description,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  description: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "number" | "password" | "search" | "tel" | "url" | "date";
  value: string;
}) {
  const s = useAdminStyles();
  return (
    <Flex direction="column" gap="2">
      <Box>
        <Text as="div" size="2" weight="medium" className={s.settings.inputLabel}>
          {label}
        </Text>
        <Text as="div" size="1" className={s.settings.inputDescription}>
          {description}
        </Text>
      </Box>
      <TextField.Root
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
        className={s.settings.inputField}
      />
    </Flex>
  );
}

function SelectRow({
  description,
  label,
  onValueChange,
  options,
  value,
}: {
  description: string;
  label: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  const s = useAdminStyles();
  return (
    <Flex direction="column" gap="2">
      <Box>
        <Text as="div" size="2" weight="medium" className={s.settings.selectLabel}>
          {label}
        </Text>
        <Text as="div" size="1" className={s.settings.selectDescription}>
          {description}
        </Text>
      </Box>
      <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger className={s.settings.selectTrigger} />
        <Select.Content>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}

export function SettingsClientView() {
  const s = useAdminStyles();
  const { setThemeMode, theme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [siteName, setSiteName] = useState("Người Lạ");
  const [siteEmail, setSiteEmail] = useState("admin@chatapp.com");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [language, setLanguage] = useState("vi");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [newUserAlerts, setNewUserAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("24h");
  const [ipWhitelist, setIpWhitelist] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [maxUsers, setMaxUsers] = useState("10000");
  const [maxChats, setMaxChats] = useState("50000");
  const [compactMode, setCompactMode] = useState(false);
  const darkMode = theme === "dark";

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Flex direction="column" gap="5">
      <Flex align={{ initial: "start", sm: "center" }} direction={{ initial: "column", sm: "row" }} gap="3" justify="between">
        <Box>
          <Heading size={{ initial: "5", md: "6" }} className={s.settings.pageHeading}>
            Cài đặt quản trị
          </Heading>
          <Text as="p" size="2" className={s.settings.descriptionText}>
            Điều chỉnh giao diện, bảo mật, thông báo và giới hạn vận hành.
          </Text>
        </Box>
        <Flex align="center" gap="2">
          {saved && (
            <Badge color="green" variant="soft">
              <CheckIcon />
              Đã lưu
            </Badge>
          )}
          <Button disabled={saving} onClick={handleSave} className={s.settings.actionButton}>
            {saving ? <ReloadIcon /> : <CheckIcon />}
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Flex>
      </Flex>

      <SettingSection
        description="Bật chế độ tối cho toàn bộ khu vực quản trị và tinh chỉnh mật độ hiển thị."
        icon={<SunIcon height={22} width={22} />}
        title="Giao diện"
      >
        <Grid columns={{ initial: "1", md: "2" }} gap="3">
          <ToggleRow
            checked={darkMode}
            description="Bật chế độ tối cho toàn bộ giao diện admin."
            label="Chế độ tối"
            onCheckedChange={(checked) => setThemeMode(checked ? "dark" : "light")}
          />
          <ToggleRow
            checked={compactMode}
            description="Thu gọn khoảng cách để xem được nhiều dữ liệu hơn."
            label="Chế độ gọn"
            onCheckedChange={setCompactMode}
          />
        </Grid>
      </SettingSection>

      <SettingSection
        description="Thông tin cơ bản dùng cho tiêu đề, email hệ thống và ngôn ngữ mặc định."
        icon={<GearIcon height={22} width={22} />}
        title="Cài đặt chung"
      >
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          <InputRow description="Tên hiển thị của ứng dụng." label="Tên trang" onChange={setSiteName} placeholder="Người Lạ" value={siteName} />
          <InputRow
            description="Email nhận thông báo từ hệ thống."
            label="Email quản trị"
            onChange={setSiteEmail}
            placeholder="admin@example.com"
            type="email"
            value={siteEmail}
          />
          <SelectRow
            description="Múi giờ mặc định cho hệ thống."
            label="Múi giờ"
            onValueChange={setTimezone}
            options={[
              { value: "Asia/Ho_Chi_Minh", label: "Hồ Chí Minh (UTC+7)" },
              { value: "Asia/Bangkok", label: "Bangkok (UTC+7)" },
              { value: "Asia/Singapore", label: "Singapore (UTC+8)" },
              { value: "UTC", label: "UTC" },
            ]}
            value={timezone}
          />
          <SelectRow
            description="Ngôn ngữ mặc định cho giao diện."
            label="Ngôn ngữ"
            onValueChange={setLanguage}
            options={[
              { value: "vi", label: "Tiếng Việt" },
              { value: "en", label: "Tiếng Anh" },
            ]}
            value={language}
          />
        </Grid>
      </SettingSection>

      <SettingSection description="Cấu hình các kênh thông báo cho quản trị viên." icon={<BellIcon height={22} width={22} />} title="Thông báo">
        <Flex direction="column" gap="2">
          <ToggleRow
            checked={emailNotifications}
            description="Gửi email khi có sự kiện quan trọng."
            label="Email thông báo"
            onCheckedChange={setEmailNotifications}
          />
          <ToggleRow
            checked={pushNotifications}
            description="Hiển thị thông báo trên trình duyệt."
            label="Thông báo đẩy"
            onCheckedChange={setPushNotifications}
          />
          <ToggleRow
            checked={weeklyDigest}
            description="Nhận bản tin tóm tắt hoạt động hằng tuần."
            label="Bản tin hằng tuần"
            onCheckedChange={setWeeklyDigest}
          />
          <Separator my="1" />
          <ToggleRow
            checked={newUserAlerts}
            description="Thông báo khi có người dùng mới đăng ký."
            label="Người dùng mới"
            onCheckedChange={setNewUserAlerts}
          />
          <ToggleRow
            checked={systemAlerts}
            description="Thông báo lỗi và cảnh báo server."
            label="Cảnh báo hệ thống"
            onCheckedChange={setSystemAlerts}
          />
        </Flex>
      </SettingSection>

      <SettingSection description="Quản lý phiên đăng nhập và lớp bảo vệ bổ sung." icon={<LockClosedIcon height={22} width={22} />} title="Bảo mật">
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          <ToggleRow
            checked={twoFactorAuth}
            description="Yêu cầu mã xác thực khi đăng nhập."
            label="Xác thực 2 lớp"
            onCheckedChange={setTwoFactorAuth}
          />
          <SelectRow
            description="Tự động đăng xuất sau thời gian không hoạt động."
            label="Thời gian hết phiên"
            onValueChange={setSessionTimeout}
            options={[
              { value: "1h", label: "1 giờ" },
              { value: "6h", label: "6 giờ" },
              { value: "12h", label: "12 giờ" },
              { value: "24h", label: "24 giờ" },
              { value: "7d", label: "7 ngày" },
            ]}
            value={sessionTimeout}
          />
          <Box gridColumn={{ md: "1 / -1" }}>
            <InputRow
              description="Để trống nếu cho phép mọi IP quản trị."
              label="Danh sách IP cho phép"
              onChange={setIpWhitelist}
              placeholder="192.168.1.1, 10.0.0.1"
              value={ipWhitelist}
            />
          </Box>
        </Grid>
      </SettingSection>

      <SettingSection description="Các giới hạn vận hành và trạng thái bảo trì." icon={<GearIcon height={22} width={22} />} title="Hệ thống">
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          <ToggleRow
            checked={maintenanceMode}
            description="Chặn người dùng thường truy cập hệ thống."
            label="Chế độ bảo trì"
            onCheckedChange={setMaintenanceMode}
          />
          <ToggleRow checked={debugMode} description="Hiển thị thông tin debug cho lập trình viên." label="Chế độ debug" onCheckedChange={setDebugMode} />
          {maintenanceMode && (
            <Box gridColumn={{ md: "1 / -1" }}>
              <Callout.Root color="amber">
                <Callout.Text>Hệ thống đang trong chế độ bảo trì. Người dùng thường sẽ không thể đăng nhập.</Callout.Text>
              </Callout.Root>
            </Box>
          )}
          <InputRow
            description="Giới hạn số lượng tài khoản đăng ký."
            label="Số người dùng tối đa"
            onChange={setMaxUsers}
            placeholder="10000"
            type="number"
            value={maxUsers}
          />
          <InputRow
            description="Giới hạn tổng số cuộc trò chuyện."
            label="Số cuộc trò chuyện tối đa"
            onChange={setMaxChats}
            placeholder="50000"
            type="number"
            value={maxChats}
          />
        </Grid>
      </SettingSection>

      <SettingSection description="Trạng thái tổng quát của bảng quản trị." icon={<CheckIcon height={22} width={22} />} title="Trạng thái hệ thống">
        <Grid columns={{ initial: "2", md: "4" }} gap="3">
          <StatusMetric label="Phiên bản" value="v1.2.3" />
          <StatusMetric label="Trạng thái" tone="green" value="Hoạt động" />
          <StatusMetric label="Uptime" value="99.8%" />
          <StatusMetric label="Deploy gần nhất" value="2 ngày trước" />
        </Grid>
      </SettingSection>
    </Flex>
  );
}

function StatusMetric({ label, tone, value }: { label: string; tone?: "green"; value: string }) {
  const s = useAdminStyles();
  return (
    <Box className={s.settings.metricCard}>
      <Text as="div" size="1" className={s.settings.metricLabel}>
        {label}
      </Text>
      <Flex align="center" gap="2" mt="1">
        {tone === "green" && <Box className={s.settings.metricDot} />}
        <Text as="div" size="3" weight="bold" className={tone === "green" ? s.settings.metricValueGreen : s.settings.metricValue}>
          {value}
        </Text>
      </Flex>
    </Box>
  );
}
