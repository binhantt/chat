import { Flex, Text } from "@radix-ui/themes";
import { CheckIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";

type VipFeatureItemProps = {
  text: string;
};

export function VipFeatureItem({ text }: VipFeatureItemProps) {
  return (
    <Flex align="center" gap="2">
      <CheckIcon color={authTheme.cyan} />
      <Text size="2" style={{ color: authTheme.text }}>
        {text}
      </Text>
    </Flex>
  );
}
