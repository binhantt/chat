import { Badge, Flex, Text } from "@radix-ui/themes";

type VipPackageHeaderProps = {
  recommended: boolean;
  title: string;
};

export function VipPackageHeader({ recommended, title }: VipPackageHeaderProps) {
  return (
    <Flex align="center" justify="between">
      <Text size="5" weight="bold" style={{ color: "var(--text-primary)" }}>
        {title}
      </Text>
      {recommended ? (
        <Badge style={{ background: "var(--primary)", color: "#FFFFFF" }}>
          Khuyên dùng
        </Badge>
      ) : null}
    </Flex>
  );
}
