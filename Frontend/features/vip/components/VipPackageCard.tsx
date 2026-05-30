import { Flex } from "@radix-ui/themes";
import { UserPanel } from "@/features/user-layout/components";
import type { VipPackage } from "../types";
import { VipBuyButton } from "./VipBuyButton";
import { VipFeatureList } from "./VipFeatureList";
import { VipPackageHeader } from "./VipPackageHeader";
import { VipPrice } from "./VipPrice";

type VipPackageCardProps = {
  item: VipPackage;
};

export function VipPackageCard({ item }: VipPackageCardProps) {
  return (
    <UserPanel>
      <Flex direction="column" gap="4">
        <VipPackageHeader recommended={item.recommended} title={item.name} />
        <VipPrice duration={item.duration} price={item.price} />
        <VipFeatureList features={item.features} />
        <VipBuyButton />
      </Flex>
    </UserPanel>
  );
}
