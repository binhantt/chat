import type { ReactNode } from "react";
import { Badge, Box, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import {
  BellIcon,
  CheckCircledIcon,
  GearIcon,
  LockClosedIcon,
  PersonIcon,
  StarIcon,
} from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { UserPageShell, UserPanel } from "@/features/user-layout/components";
import { SettingsForm, Avatar3D } from "../components";

export function SettingsPage() {
  return (
    <UserPageShell>
      <Flex
        align={{ initial: "start", md: "end" }}
        direction={{ initial: "column", md: "row" }}
        gap="4"
        justify="between"
        style={{
          borderBottom: `1px solid ${authTheme.line}`,
          paddingBottom: 18,
        }}
      >
        <Flex direction="column" gap="3" style={{ maxWidth: 620 }}>
          <Badge
            size="3"
            style={{
              alignSelf: "flex-start",
              background: "rgba(59, 130, 246, 0.1)",
              border: `1px solid ${authTheme.line}`,
              color: authTheme.text,
            }}
          >
            <Flex align="center" gap="2">
              <GearIcon />
              <Text size="2" weight="bold">
                Cài đặt tài khoản
              </Text>
            </Flex>
          </Badge>
          <Box>
            <Heading
              as="h1"
              size="7"
              style={{ color: authTheme.text, letterSpacing: 0, lineHeight: 1.08 }}
            >
              Dieu chinh tai khoan gon gang hon.
            </Heading>
            <Text
              as="p"
              size="3"
              style={{
                color: authTheme.muted,
                lineHeight: 1.65,
                margin: "10px 0 0",
              }}
            >
              Quản lý thông tin, tùy chọn nhanh và các thao tác bảo mật trong
              mot bo cuc sach, de quet va khong long border ngoai.
            </Text>
          </Box>
        </Flex>

        <Grid columns="3" gap="2" style={{ minWidth: 300 }}>
          <Metric icon={<PersonIcon />} label="Hồ sơ" value="Đồng bộ" />
          <Metric icon={<BellIcon />} label="Thông báo" value="Bật" />
          <Metric icon={<LockClosedIcon />} label="Bảo mật" value="Riêng" />
        </Grid>
      </Flex>

      <Grid columns={{ initial: "1", lg: "2" }} gap="4" style={{ alignItems: "start" }}>
        <UserPanel borderless maxWidth={720} padding="4">
          <SettingsForm />
        </UserPanel>

        <UserPanel borderless maxWidth={520} padding="4">
          <Flex direction="column" gap="4">
            <Avatar3D />
            <QuickPanel
              icon={<CheckCircledIcon />}
              items={[
                "Thông tin hồ sơ đang được đồng bộ",
                "Tùy chọn nhanh được lưu trên thiết bị",
                "Khu vực nguy hiểm đã tách riêng",
              ]}
              title="Trạng thái cài đặt"
            />
            <QuickPanel
              icon={<StarIcon />}
              items={[
                "VIP đang chuẩn bị mở khóa",
                "Avatar chỉ là xem trước giao diện",
                "Cập nhật hồ sơ tại tab Cá nhân",
              ]}
              title="Ghi chú nhanh"
            />
            <Box
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.86))",
                border: `1px solid ${authTheme.line}`,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <Flex direction="column" gap="2">
                <Text size="3" weight="bold" style={{ color: authTheme.text }}>
                  Gợi ý
                </Text>
                <Text size="2" style={{ color: authTheme.muted, lineHeight: 1.6 }}>
                  Muốn sửa tên, thành phố hoặc giới thiệu, hãy cập nhật trong
                  tab Cá nhân để đồng bộ với hồ sơ trò chuyện.
                </Text>
              </Flex>
            </Box>
          </Flex>
        </UserPanel>
      </Grid>
    </UserPageShell>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box
      style={{
        background: "rgba(255, 255, 255, 0.72)",
        border: `1px solid ${authTheme.line}`,
        borderRadius: 8,
        padding: 10,
      }}
    >
      <Flex align="center" gap="2">
        <Box style={{ color: authTheme.control }}>{icon}</Box>
        <Box>
          <Text as="div" size="1" style={{ color: authTheme.muted }}>
            {label}
          </Text>
          <Text as="div" size="2" weight="bold" style={{ color: authTheme.text }}>
            {value}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

function QuickPanel({
  icon,
  items,
  title,
}: {
  icon: ReactNode;
  items: string[];
  title: string;
}) {
  return (
    <Box
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.86))",
        border: `1px solid ${authTheme.line}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <Flex direction="column" gap="3">
        <Flex align="center" gap="2">
          <Box style={{ color: authTheme.control }}>{icon}</Box>
          <Text size="3" weight="bold" style={{ color: authTheme.text }}>
            {title}
          </Text>
        </Flex>
        <Flex direction="column" gap="2">
          {items.map((item) => (
            <Flex align="center" gap="2" key={item}>
              <Box
                style={{
                  background: authTheme.control,
                  borderRadius: 999,
                  height: 6,
                  width: 6,
                }}
              />
              <Text size="2" style={{ color: authTheme.muted }}>
                {item}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}
