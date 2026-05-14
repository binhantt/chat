"use client";

import { Flex, Text, Box, TextField, Avatar, Button } from "@radix-ui/themes";
import { MagnifyingGlassIcon, BellIcon, EnvelopeOpenIcon, ExitIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export function AdminNavbar() {
  const [search, setSearch] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);

    void fetch("/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      window.location.href = "/admin/login";
    });
  };

  return (
    <Flex
      align="center"
      justify="between"
      p="4"
      pr="5"
      style={{
        height: 60,
        background: "var(--indigo-3)",
        borderBottom: "1px solid var(--indigo-6)",
        position: "fixed",
        top: 0,
        left: 260,
        right: 0,
        zIndex: 10,
      }}
    >
      {/* Search */}
      <Flex align="center" gap="3" style={{ flex: 1, maxWidth: 480 }}>
        <TextField.Root
          placeholder="Tìm kiếm người dùng, tin nhắn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", background: "var(--gray-1)" }}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon width={16} height={16} color="var(--gray-9)" />
          </TextField.Slot>
        </TextField.Root>
      </Flex>

      {/* Right side */}
      <Flex align="center" gap="4">
        {/* Notifications */}
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "var(--indigo-5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <BellIcon width={20} height={20} color="var(--indigo-11)" />
          <Box
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--red-9)",
            }}
          />
        </Box>

        {/* Messages */}
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "var(--indigo-5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <EnvelopeOpenIcon width={20} height={20} color="var(--indigo-11)" />
        </Box>

        {/* User */}
        <Flex
          align="center"
          gap="3"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
            background: "var(--indigo-5)",
          }}
        >
          <Avatar size="2" fallback="AD" color="indigo" />
          <Flex direction="column">
            <Text size="2" weight="medium" color="indigo" highContrast>Admin User</Text>
            <Text size="1" color="indigo" style={{ opacity: 0.7 }}>Quản trị viên</Text>
          </Flex>
        </Flex>

        <Button
          color="red"
          variant="soft"
          onClick={handleLogout}
          disabled={loggingOut}
          style={{ height: 40, cursor: loggingOut ? "default" : "pointer" }}
        >
          <ExitIcon width={16} height={16} />
          {loggingOut ? "Đang xuất..." : "Đăng xuất"}
        </Button>
      </Flex>
    </Flex>
  );
}
