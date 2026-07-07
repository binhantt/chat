"use client";

import { Badge, Box, DropdownMenu, Flex, Spinner, Text, Tooltip } from "@radix-ui/themes";
import { ExitIcon, GearIcon, PersonIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { AvatarWithVipBadge } from "@/components/shared/AvatarWithVipBadge";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const displayName = user?.fullName || user?.email || "Người dùng";

  return (
    <Flex
      align="center"
      data-navbar
      justify="between"
      px={{ initial: "3", md: "5" }}
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        color: "var(--text-primary)",
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
                  background: "rgba(168, 85, 247, 0.08)",
                  border: "1px solid rgba(168, 85, 247, 0.14)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {displayName}
              </Badge>
            </Box>

            <Tooltip content={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}>
              <Flex
                align="center"
                justify="center"
                onClick={toggleTheme}
                style={{
                  background: "rgba(168, 85, 247, 0.08)",
                  borderRadius: 8,
                  color: "var(--chat-accent)",
                  cursor: "pointer",
                  height: 32,
                  width: 32,
                }}
              >
                {theme === "dark" ? (
                  <SunIcon width={16} height={16} />
                ) : (
                  <MoonIcon width={16} height={16} />
                )}
              </Flex>
            </Tooltip>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Box style={{ cursor: "pointer" }}>
                  <Tooltip content="Menu người dùng">
                    <AvatarWithVipBadge
                      fallback={getUserInitials(displayName)}
                      radius="full"
                      size="2"
                      src={user?.avatarUrl || undefined}
                      badge={user?.badge}
                      style={{
                        background: "var(--chat-accent)",
                        color: "#FFFFFF",
                      }}
                    />
                  </Tooltip>
                </Box>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" sideOffset={10}>
                <DropdownMenu.Label>
                  <Text size="2" weight="bold">{displayName}</Text>
                </DropdownMenu.Label>
                <DropdownMenu.Separator />
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
