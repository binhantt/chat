"use client";

import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { useAuth } from "@/contexts/AuthContext";
import { AvatarWithVipBadge } from "@/components/shared/AvatarWithVipBadge";
import { AboutForm } from "../components/AboutForm";

export function AboutPage() {
  const { user } = useAuth();
  const initials = getInitials(user?.fullName || user?.email);

  return (
    <Box style={{ background: "var(--bg-primary)", minHeight: "100%", padding: "28px clamp(16px, 2.2vw, 32px)" }}>
      <Flex direction="column" gap="5" style={{ margin: "0 auto", maxWidth: 640, width: "100%" }}>
        {/* Card */}
        <Box style={{ background: "var(--chat-surface)", borderRadius: 16, padding: 28 }}>
          <Flex direction="column" gap="5">
            {/* Avatar + name row */}
            <Flex align="center" gap="4">
              <AvatarWithVipBadge
                fallback={initials}
                radius="full"
                size="5"
                src={user?.avatarUrl || undefined}
                badge={user?.badge}
                style={{
                  background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(75, 46, 131, 0.12)",
                }}
              />
              <Box>
                <Heading as="h1" size="5" style={{ color: "var(--chat-text)", fontFamily: "var(--font-heading)", lineHeight: 1.2 }}>
                  {user?.fullName || "Hoàn thiện hồ sơ"}
                </Heading>
                <Text as="p" size="2" style={{ color: "var(--chat-muted)", marginTop: 1 }}>
                  {user?.email || "Đăng nhập để đồng bộ thông tin"}
                </Text>
              </Box>
            </Flex>

            {/* Description */}
            <Text size="2" style={{ color: "var(--chat-muted)", lineHeight: 1.6, margin: 0 }}>
              Cập nhật thông tin cơ bản để người khác hiểu bạn hơn trước khi bắt đầu trò chuyện.
            </Text>

            {/* Divider */}
            <Box style={{ height: 1, background: "var(--chat-border)", width: "100%" }} />

            {/* Form */}
            <AboutForm />
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

function getInitials(value?: string | null) {
  if (!value) return "U";
  return value.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
