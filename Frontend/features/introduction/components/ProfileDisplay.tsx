"use client";

import { Flex, Text, Box, Avatar, Badge } from "@radix-ui/themes";
import { useAuth } from "@/contexts/AuthContext";

export function ProfileDisplay() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = (user.fullName || user.email || "?")
    .trim()
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Flex direction="column" gap="4">
      <Flex align="center" gap="4">
        <Avatar
          size="5"
          radius="full"
          src={user.avatarUrl || undefined}
          fallback={initials}
          style={{ background: "var(--indigo-9)", color: "white" }}
        />
        <Flex direction="column" gap="1">
          <Text size="5" weight="bold">
            {user.fullName || "Chưa đặt tên hiển thị"}
          </Text>
          <Badge color={user.role === "admin" ? "indigo" : "gray"} variant="soft">
            {user.role === "admin" ? "Admin" : "Người dùng"}
          </Badge>
        </Flex>
      </Flex>

      <Flex direction="column" gap="2">
        <Field label="Tên đăng nhập (Email)" value={user.email} icon={MailIcon} />
        <Field label="Tên hiển thị" value={user.fullName || "Chưa đặt"} icon={UserIcon} />
        <Field label="Ngày tham gia" value={formatDate(user.createdAt)} icon={CalendarIcon} />
        {user.city && <Field label="Thành phố" value={user.city} icon={PinIcon} />}
        {user.gender && <Field label="Giới tính" value={genderLabel(user.gender)} icon={GenderIcon} />}
      </Flex>

      <Box
        p="3"
        style={{
          background: "var(--indigo-2)",
          borderRadius: "var(--radius-3)",
          border: "1px solid var(--indigo-4)",
        }}
      >
        <Text size="2" color="indigo" weight="medium">
          Cập nhật thông tin bên dưới hoặc vào{" "}
          <a href="/settings" style={{ textDecoration: "underline", color: "var(--indigo-10)" }}>
            Cài đặt
          </a>
        </Text>
      </Box>
    </Flex>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Flex align="center" gap="3">
      <Box style={{ color: "var(--gray-10)", flexShrink: 0 }}>{icon}</Box>
      <Flex direction="column" gap="0">
        <Text size="1" color="gray">
          {label}
        </Text>
        <Text size="2">{value}</Text>
      </Flex>
    </Flex>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function genderLabel(g: "male" | "female" | "other") {
  return g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác";
}

const MailIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const UserIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PinIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const GenderIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 0 0 20" />
  </svg>
);
