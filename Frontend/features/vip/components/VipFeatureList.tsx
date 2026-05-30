import { Flex } from "@radix-ui/themes";
import { VipFeatureItem } from "./VipFeatureItem";

type VipFeatureListProps = {
  features: string[];
};

export function VipFeatureList({ features }: VipFeatureListProps) {
  return (
    <Flex direction="column" gap="2">
      {features.map((feature) => (
        <VipFeatureItem key={feature} text={feature} />
      ))}
    </Flex>
  );
}
