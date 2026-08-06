"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import Link from "next/link";

export function PublicNavbar() {
  return (
    <nav aria-label="Điều hướng công khai">
    <Flex
      align="center"
      data-navbar
      justify="between"
      px={{ initial: "3", sm: "4", md: "5" }}
      style={{
        background: "var(--auth-bg)",
        borderBottom: "1px solid var(--auth-line)",
        color: "var(--auth-text)",
        height: 56,
        minHeight: 56,
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <Flex align="center" gap={{ initial: "2", sm: "3" }}>
          <Box
            style={{
              borderRadius: 8,
              flexShrink: 0,
              height: 32,
              width: 38,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <img
              alt=""
              src="/nguoi-la-logo.png"
              style={{ height: "100%", width: "100%", objectFit: "contain", padding: 4 }}
            />
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Text
              as="div"
              size={{ initial: "2", sm: "3" }}
              weight="bold"
              style={{ color: "var(--auth-text)", lineHeight: 1.1, whiteSpace: "nowrap" }}
            >
              Người Lạ
            </Text>
            <Text
              as="div"
              size="1"
              style={{ color: "var(--auth-muted)", lineHeight: 1.3, whiteSpace: "nowrap" }}
            >
              Kết nối an toàn
            </Text>
          </Box>
        </Flex>
      </Link>
    </Flex>
    </nav>
  );
}
