import { VipBenefitsGrid } from "../components/VipBenefitsGrid";
import { VipHero } from "../components/VipHero";
import { VipPackagesGrid } from "../components/VipPackagesGrid";
import { useVipBenefits } from "../hooks/useVipBenefits";
import { useVipPackages } from "../hooks/useVipPackages";
import { UserPageShell } from "@/features/user-layout/components";

export function VipPage() {
  const benefits = useVipBenefits();
  const packages = useVipPackages();

  return (
    <UserPageShell>
      <VipHero />
      <VipBenefitsGrid benefits={benefits} />
      <VipPackagesGrid packages={packages} />
    </UserPageShell>
  );
}
