import { Flex, Text } from "@radix-ui/themes";
import { CheckIcon } from "@radix-ui/react-icons";

type VipFeatureItemProps = {
  text: string;
};

export function VipFeatureItem({ text }: VipFeatureItemProps) {
  return (
    <Flex align="center" gap="2">
      <CheckIcon color="#22d3ee" />
      <Text size="2" style={{ color: "var(--text-primary)" }}>
        {text}
      </Text>
    </Flex>
  );
}
