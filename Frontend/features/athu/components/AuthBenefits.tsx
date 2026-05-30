"use client";

import { Badge, Flex } from "@radix-ui/themes";
import { authTheme } from "../styles/authTheme";

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
            background: "rgba(59, 130, 246, 0.10)",
            border: `1px solid ${authTheme.line}`,
            color: authTheme.text,
            padding: "4px 8px",
          }}
        >
          {benefit}
        </Badge>
      ))}
    </Flex>
  );
}
