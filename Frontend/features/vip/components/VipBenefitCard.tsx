import { EyeOpenIcon, ImageIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { FeatureTile } from "@/features/user-layout/components";
import type { VipBenefit } from "../types";

const benefitIcons = {
  identity: <EyeOpenIcon height={22} width={22} />,
  image: <ImageIcon height={22} width={22} />,
  theme: <MagicWandIcon height={22} width={22} />,
};

type VipBenefitCardProps = {
  benefit: VipBenefit;
};

export function VipBenefitCard({ benefit }: VipBenefitCardProps) {
  return (
    <FeatureTile
      description={benefit.description}
      icon={benefitIcons[benefit.icon]}
      title={benefit.title}
      tone={benefit.tone}
    />
  );
}
