"use client";

import { Flex, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export function AuthTerms() {
  return (
    <Flex
      align="start"
      gap="2"
      style={{
        justifyContent: "center",
        paddingInline: 8,
      }}
    >
      <InfoCircledIcon color="var(--auth-muted)" height={14} width={14} />
      <Text
        as="p"
        size="1"
        style={{
          color: "var(--auth-muted)",
          fontFamily: "var(--font-body)",
          lineHeight: 1.5,
          margin: 0,
          textAlign: "center",
        }}
      >
        Tiếp tục nghĩa là bạn đồng ý với điều khoản và chính sách bảo mật.
      </Text>
    </Flex>
  );
}
