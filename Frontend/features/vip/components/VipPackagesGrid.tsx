import { Grid } from "@radix-ui/themes";
import type { VipPackage } from "../types";
import { VipPackageCard } from "./VipPackageCard";

type VipPackagesGridProps = {
  packages: VipPackage[];
};

export function VipPackagesGrid({ packages }: VipPackagesGridProps) {
  return (
    <Grid columns={{ initial: "1", md: "3" }} gap="4" mt="4">
      {packages.map((item) => (
        <VipPackageCard item={item} key={item.id} />
      ))}
    </Grid>
  );
}
