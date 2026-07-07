"use client";

import { Flex, Text } from "@radix-ui/themes";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function AuthCopy() {
  return (
    <Flex align="center" direction="column" gap="4" style={{ textAlign: "center" }}>
      <BrandLogo compact />
      <Flex align="center" direction="column" gap="2">
        <Text
          size="4"
          weight="bold"
          style={{
            color: "var(--auth-control)",
            fontFamily: "var(--font-heading)",
            letterSpacing: "0.02em",
          }}
        >
          Người Lạ
        </Text>
        <h2
          style={{
            color: "var(--auth-text)",
            fontSize: 24,
            fontWeight: 700,
            fontFamily: "var(--font-heading)",
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          Đăng nhập để kết nối
        </h2>
      </Flex>
      <Text
        as="p"
        size="2"
        style={{
          color: "var(--auth-muted)",
          fontFamily: "var(--font-body)",
          lineHeight: 1.6,
          margin: 0,
          maxWidth: 280,
        }}
      >
        Vào phòng trò chuyện, đồng bộ hồ sơ và tiếp tục câu chuyện của bạn.
      </Text>
    </Flex>
  );
}
