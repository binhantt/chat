"use client";

import { Avatar, Badge, Box, DropdownMenu, Flex, Spinner } from "@radix-ui/themes";
import { ExitIcon, GearIcon, PersonIcon } from "@radix-ui/react-icons";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { authTheme } from "@/features/athu/styles/authTheme";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const displayName = user?.fullName || user?.email || "Người dùng";

  return (
    <Flex
      align="center"
      data-navbar
      justify="between"
      px={{ initial: "3", md: "5" }}
      style={{
        background: authTheme.panel,
        borderBottom: `1px solid ${authTheme.line}`,
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
        color: authTheme.text,
        height: 64,
        minHeight: 64,
      }}
    >
      <BrandLogo compact subtitle="Kết nối an toàn" />

      <Flex align="center" gap="3">
        {loading ? (
          <Spinner size="2" />
        ) : (
          <>
            <Box display={{ initial: "none", sm: "block" }}>
              <Badge
                size="2"
                style={{
                  background: "rgba(34, 211, 238, 0.14)",
                  border: `1px solid ${authTheme.line}`,
                  color: authTheme.text,
                }}
              >
                {displayName}
              </Badge>
            </Box>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Box style={{ cursor: "pointer" }}>
                  <Avatar
                    fallback={getUserInitials(displayName)}
                    radius="full"
                    size="2"
                    src={user?.avatarUrl || undefined}
                    style={{ background: authTheme.control, color: "#FFFFFF" }}
                  />
                </Box>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" sideOffset={10}>
                <DropdownMenu.Item>
                  <PersonIcon />
                  Tài khoản
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  <GearIcon />
                  Cài đặt
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item color="red" onClick={logout}>
                  <ExitIcon />
                  Đăng xuất
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </>
        )}
      </Flex>
    </Flex>
  );
}

function getUserInitials(userName: string) {
  if (!userName) return "?";

  return userName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
