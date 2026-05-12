"use client";

import { Flex, Text, Box } from "@radix-ui/themes";
import { AboutForm } from "../components/AboutForm";

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
        opacity: 0.08,
        pointerEvents: "none",
        borderRadius: "0 0 80px 0",
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
        opacity: 0.08,
        pointerEvents: "none",
        borderRadius: "80px 0 0 0",
        background: "var(--violet-9)",
      }}
    />
  );
}

export function AboutPage() {
  return (
    <Box
      position="relative"
      style={{ flex: 1, overflow: "auto", background: "var(--gray-1)" }}
    >
      <DecorTopLeft />
      <DecorBottomRight />

      <Flex
        direction="column"
        align="center"
        style={{ minHeight: "100%", padding: "28px 16px 48px" }}
      >
        <Flex direction="column" gap="5" style={{ maxWidth: 520, width: "100%" }}>
          <Flex direction="column" gap="2" align="center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--indigo-9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <Text size="6" weight="bold" color="indigo">
              Giới thiệu bản thân
            </Text>
            <Text size="3" color="gray" align="center">
              Cập nhật thông tin cá nhân của bạn
            </Text>
          </Flex>

          <Box p="5">
            <AboutForm />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
