"use client";

import { Avatar, Badge, Box, Flex, Heading, Text } from "@radix-ui/themes";
import {
  CalendarIcon,
  ChatBubbleIcon,
  PersonIcon,
  SewingPinIcon,
} from "@radix-ui/react-icons";
import { useAuth } from "@/contexts/AuthContext";
import { authTheme } from "@/features/athu/styles/authTheme";
import { UserPanel } from "@/features/user-layout/components";
import { AboutForm } from "../components/AboutForm";

export function AboutPage() {
  const { user } = useAuth();
  const initials = getInitials(user?.fullName || user?.email);

  return (
    <Box
      style={{
        background: `radial-gradient(circle at 18% 12%, rgba(59, 130, 246, 0.16), transparent 28%), radial-gradient(circle at 88% 18%, rgba(34, 211, 238, 0.10), transparent 26%), ${authTheme.background}`,
        color: authTheme.text,
        minHeight: "100%",
        overflow: "hidden",
        padding: "22px clamp(16px, 2.2vw, 28px)",
      }}
    >
      <Flex
        align="center"
        gap="7"
        justify="center"
        style={{ minHeight: "100%" }}
        wrap="wrap"
      >
        <Box style={{ maxWidth: 500, width: "100%" }}>
          <Flex direction="column" gap="5">
            <Badge
              size="3"
              style={{
                alignSelf: "flex-start",
                background: "rgba(59, 130, 246, 0.12)",
                border: `1px solid ${authTheme.line}`,
                color: authTheme.text,
              }}
            >
              <Flex align="center" gap="2">
                <PersonIcon />
                <Text size="2" weight="bold">
                  Hồ sơ cá nhân
                </Text>
              </Flex>
            </Badge>

            <Flex align="center" gap="4">
              <Avatar
                fallback={initials}
                radius="full"
                size="7"
                src={user?.avatarUrl || undefined}
                style={{
                  background: authTheme.control,
                  color: "#FFFFFF",
                }}
              />
              <Box>
                <Heading
                  as="h1"
                  size="7"
                  style={{ color: authTheme.text, letterSpacing: 0, lineHeight: 1.04 }}
                >
                  {user?.fullName || "Hoan thien ho so cua ban"}
                </Heading>
                <Text as="p" size="3" style={{ color: authTheme.muted, margin: 0 }}>
                  {user?.email || "Đăng nhập để đồng bộ thông tin cá nhân"}
                </Text>
              </Box>
            </Flex>

            <Text
              as="p"
              size="4"
              style={{
                color: authTheme.muted,
                lineHeight: 1.7,
                margin: 0,
                maxWidth: 480,
              }}
            >
              Cập nhật thông tin cơ bản để người khác hiểu bạn hơn trước khi
              bat dau tro chuyen.
            </Text>

            <Flex gap="3" wrap="wrap">
              <ProfilePill icon={<ChatBubbleIcon />} label="Kết nối nhanh" />
              <ProfilePill icon={<SewingPinIcon />} label={user?.city || "Chưa có vị trí"} />
              <ProfilePill
                icon={<CalendarIcon />}
                label={user?.createdAt ? `Tham gia ${formatYear(user.createdAt)}` : "Hồ sơ mới"}
              />
            </Flex>
          </Flex>
        </Box>

        <UserPanel maxWidth={560}>
          <AboutForm />
        </UserPanel>
      </Flex>
    </Box>
  );
}

function ProfilePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Badge
      size="3"
      style={{
        background: "rgba(255, 255, 255, 0.74)",
        border: `1px solid ${authTheme.line}`,
        color: authTheme.text,
        padding: "8px 12px",
      }}
    >
      <Flex align="center" gap="2">
        <Box style={{ color: authTheme.cyan }}>{icon}</Box>
        {label}
      </Flex>
    </Badge>
  );
}

function getInitials(value?: string | null) {
  if (!value) {
    return "U";
  }

  return value
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatYear(value: string) {
  return new Date(value).getFullYear().toString();
}
