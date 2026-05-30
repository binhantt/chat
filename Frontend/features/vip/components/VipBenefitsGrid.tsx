import { Grid } from "@radix-ui/themes";
import type { VipBenefit } from "../types";
import { VipBenefitCard } from "./VipBenefitCard";

type VipBenefitsGridProps = {
  benefits: VipBenefit[];
};

export function VipBenefitsGrid({ benefits }: VipBenefitsGridProps) {
  return (
    <Grid columns={{ initial: "1", md: "3" }} gap="3" mt="4">
      {benefits.map((benefit) => (
        <VipBenefitCard benefit={benefit} key={benefit.title} />
      ))}
    </Grid>
  );
}
