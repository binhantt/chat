"use client";

import { Flex, Text, Box, Avatar, DropdownMenu, Spinner } from "@radix-ui/themes";
import { useAuth, User } from "@/contexts/AuthContext";

export function Navbar() {
  const { user, loading, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (userName: string) => {
    if (!userName) return "?";
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Flex
        align="center"
        justify="between"
        px="5"
        data-navbar
        style={{
          height: 60,
          background: "var(--indigo-3)",
          borderBottom: "1px solid var(--indigo-6)",
        }}
      >
        <Flex align="center" gap="3">
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="48" height="40" rx="12" fill="url(#navGrad)" />
            <path d="M8 44 L16 52 L24 44" fill="url(#navGrad)" />
            <circle cx="20" cy="18" r="6" fill="white" fillOpacity="0.95" />
            <path d="M10 36 C10 30 15 28 20 28 C25 28 30 30 30 36" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.95" />
            <circle cx="40" cy="16" r="5" fill="white" fillOpacity="0.8" />
            <path d="M31 32 C31 27 35 25 40 25 C45 25 49 27 49 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.8" />
            <defs>
              <linearGradient id="navGrad" x1="4" y1="4" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <Text size="4" weight="bold" color="indigo">
            ChatApp
          </Text>
        </Flex>

        <Flex align="center" gap="3">
          <Spinner size="2" />
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      align="center"
      justify="between"
      px="5"
      data-navbar
      style={{
        height: 60,
        background: "var(--indigo-3)",
        borderBottom: "1px solid var(--indigo-6)",
      }}
    >
      <Flex align="center" gap="3">
        <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="48" height="40" rx="12" fill="url(#navGrad)" />
          <path d="M8 44 L16 52 L24 44" fill="url(#navGrad)" />
          <circle cx="20" cy="18" r="6" fill="white" fillOpacity="0.95" />
          <path d="M10 36 C10 30 15 28 20 28 C25 28 30 30 30 36" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.95" />
          <circle cx="40" cy="16" r="5" fill="white" fillOpacity="0.8" />
          <path d="M31 32 C31 27 35 25 40 25 C45 25 49 27 49 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.8" />
          <defs>
            <linearGradient id="navGrad" x1="4" y1="4" x2="52" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        <Text size="4" weight="bold" color="indigo">
          ChatApp
        </Text>
      </Flex>

      <Flex align="center" gap="3">
        <Box display={{ initial: "none", sm: "block" }}>
          <Text size="2" color="gray">
            {user?.fullName || "Người dùng"}
          </Text>
        </Box>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Box style={{ cursor: "pointer", perspective: 800 }}>
              <Box
                style={{
                  transform: "rotateY(-5deg) rotateX(5deg)",
                  transition: "transform 0.2s",
                }}
              >
                <Avatar
                  size="2"
                  radius="full"
                  src={user?.avatarUrl || undefined}
                  fallback={getUserInitials(user?.fullName || user?.email || "")}
                  style={{ background: "var(--indigo-9)", color: "white" }}
                />
              </Box>
            </Box>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content sideOffset={8} align="end">
            <DropdownMenu.Item>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Tài khoản
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Cài đặt
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item color="red" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Đăng xuất
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </Flex>
  );
}