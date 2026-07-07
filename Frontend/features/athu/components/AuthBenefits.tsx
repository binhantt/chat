"use client";

import { Badge, Flex } from "@radix-ui/themes";

const benefits = ["Nhanh", "Bảo mật", "Đồng bộ hồ sơ"];

export function AuthBenefits() {
  return (
    <Flex gap="2" wrap="wrap">
      {benefits.map((benefit) => (
        <Badge
          key={benefit}
          size="2"
          variant="soft"
          style={{
            background: "rgba(168, 85, 247, 0.08)",
            border: `1px solid var(--chat-border)`,
            color: "var(--text-primary)",
            padding: "4px 8px",
          }}
        >
          {benefit}
        </Badge>
      ))}
    </Flex>
  );
}
