"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import { BrandLogo } from "@/components/brand/BrandLogo";
import Link from "next/link";

export function PublicNavbar() {
  return (
    <Flex
      align="center"
      data-navbar
      justify="between"
      px={{ initial: "3", md: "5" }}
      style={{
        background: "var(--auth-bg)",
        borderBottom: "1px solid var(--auth-line)",
        color: "var(--auth-text)",
        height: 64,
        minHeight: 64,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <Flex align="center" gap="2">
          <Box
            style={{
              borderRadius: 8,
              flexShrink: 0,
              height: 36,
              overflow: "hidden",
              position: "relative",
              width: 44,
            }}
          >
            <img
              alt="Người Lạ"
              src="/nguoi-la-logo.svg"
              style={{ height: "100%", width: "100%", objectFit: "contain", padding: 4 }}
            />
          </Box>
          <Box>
            <Text
              as="div"
              size="3"
              weight="bold"
              style={{ color: "var(--auth-text)", lineHeight: 1.1 }}
            >
              Người Lạ
            </Text>
            <Text
              as="div"
              size="1"
              style={{ color: "var(--auth-muted)", lineHeight: 1.3 }}
            >
              Kết nối an toàn
            </Text>
          </Box>
        </Flex>
      </Link>

      <Flex align="center" gap="2">
        <Link
          href="/"
          style={{
            color: "var(--auth-control)",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
            padding: "6px 10px",
            borderRadius: 8,
            transition: "background 0.2s",
          }}
        >
          Trang chủ
        </Link>
        <Link
          href="/login"
          style={{
            background: "var(--auth-control)",
            color: "#fff",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
            padding: "8px 14px",
            borderRadius: 8,
            transition: "opacity 0.2s",
          }}
        >
          Tham gia ngay
        </Link>
      </Flex>
    </Flex>
  );
}
