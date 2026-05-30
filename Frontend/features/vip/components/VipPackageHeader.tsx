import { Badge, Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";

type VipPackageHeaderProps = {
  recommended: boolean;
  title: string;
};

export function VipPackageHeader({ recommended, title }: VipPackageHeaderProps) {
  return (
    <Flex align="center" justify="between">
      <Text size="5" weight="bold" style={{ color: authTheme.text }}>
        {title}
      </Text>
      {recommended ? (
        <Badge style={{ background: authTheme.control, color: "#FFFFFF" }}>
          Khuyên dùng
        </Badge>
      ) : null}
    </Flex>
  );
}
