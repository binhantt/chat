"use client";

import { Flex, Heading, Text } from "@radix-ui/themes";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { authTheme } from "../styles/authTheme";

export function AuthBrand() {
  return (
    <Flex direction="column" gap="3">
      <Flex align="center" gap="3">
        <BrandLogo compact />
        <Text size="2" style={{ color: authTheme.muted }}>
          Kết nối an toàn
        </Text>
      </Flex>
      <Heading
        as="h1"
        size="9"
        style={{ color: authTheme.text, letterSpacing: 0, lineHeight: 1 }}
      >
        Người Lạ
      </Heading>
    </Flex>
  );
}
