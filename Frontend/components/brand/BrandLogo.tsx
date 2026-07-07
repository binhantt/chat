import Image from "next/image";
import { Box, Flex, Text } from "@radix-ui/themes";

type BrandLogoProps = {
  compact?: boolean;
  subtitle?: string;
};

export function BrandLogo({ compact = false, subtitle }: BrandLogoProps) {
  return (
    <Flex align="center" gap={compact ? "2" : "3"}>
      <Box
        style={{
          borderRadius: 8,
          flexShrink: 0,
          height: compact ? 42 : 52,
          overflow: "hidden",
          position: "relative",
          width: compact ? 54 : 68,
        }}
      >
        <Image
          alt="Người Lạ"
          fill
          sizes={compact ? "54px" : "68px"}
          src="/nguoi-la-logo.svg"
          style={{ objectFit: "contain", padding: 4 }}
        />
      </Box>
      <Box>
        <Text as="div" size={compact ? "3" : "4"} weight="bold" style={{ color: "var(--chat-text)", lineHeight: 1.1 }}>
          Người Lạ
        </Text>
        {subtitle && (
          <Text as="div" size="1" style={{ color: "var(--chat-muted)", lineHeight: 1.3 }}>
            {subtitle}
          </Text>
        )}
      </Box>
    </Flex>
  );
}
