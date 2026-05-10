"use client";

import { Flex, Text, Box } from "@radix-ui/themes";
import { SettingsForm, Avatar3D } from "../components";

function DecorTopLeft() {
  return (
    <Box
      display={{ initial: "none", md: "block" }}
      position="absolute"
      left="0"
      top="0"
      style={{
        width: 160,
        height: 160,
        opacity: 0.07,
        pointerEvents: "none",
        background: "var(--indigo-9)",
      }}
    />
  );
}

function DecorBottomRight() {
  return (
    <Box
      display={{ initial: "none", md: "block" }}
      position="absolute"
      right="0"
      bottom="0"
      style={{
        width: 120,
        height: 120,
        opacity: 0.07,
        pointerEvents: "none",
        background: "var(--violet-9)",
      }}
    />
  );
}

export function SettingsPage() {
  return (
    <Box
      position="relative"
      style={{ flex: 1, background: "var(--gray-1)" }}
    >
      <DecorTopLeft />
      <DecorBottomRight />

      <Flex
        direction="column"
        align="center"
        style={{ minHeight: "100%", padding: "24px 16px", overflowY: "auto" }}
      >
        <Flex direction="column" gap="6" style={{ maxWidth: 560, width: "100%" }}>
          <Flex direction="column" gap="2" align="center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--indigo-9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <Text size="6" weight="bold" color="indigo">
              Cài đặt
            </Text>
            <Text size="3" color="gray" align="center">
              Quản lý tài khoản và tùy chọn
            </Text>
          </Flex>

          <Box
            p="5"
            style={{
              background: "var(--white)",
              boxShadow: "0 2px 12px rgba(99, 102, 241, 0.06)",
            }}
          >
            <SettingsForm />
          </Box>

          <Box
            p="5"
            style={{
              background: "var(--white)",
              boxShadow: "0 2px 12px rgba(99, 102, 241, 0.06)",
            }}
          >
            <Avatar3D />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
