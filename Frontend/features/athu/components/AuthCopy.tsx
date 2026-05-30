"use client";

import { Flex, Heading, Text } from "@radix-ui/themes";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { authTheme } from "../styles/authTheme";

export function AuthCopy() {
  return (
    <Flex align="center" direction="column" gap="3" style={{ textAlign: "center" }}>
      <BrandLogo compact />
      <Flex align="center" direction="column" gap="1">
        <Text size="2" weight="medium" style={{ color: authTheme.control }}>
          Người Lạ
        </Text>
        <Heading
          as="h2"
          size="6"
          style={{ color: authTheme.text, lineHeight: 1.08, margin: 0 }}
        >
          Đăng nhập bằng Google
        </Heading>
      </Flex>
      <Text
        as="p"
        size="2"
        style={{
          color: authTheme.muted,
          lineHeight: 1.55,
          margin: 0,
          maxWidth: 300,
        }}
      >
        Vào phòng trò chuyện, đồng bộ hồ sơ và tiếp tục câu chuyện của bạn.
      </Text>
    </Flex>
  );
}
