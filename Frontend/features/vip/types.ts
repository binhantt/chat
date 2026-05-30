export type VipBenefitIcon = "identity" | "image" | "theme";

export type VipBenefit = {
  description: string;
  icon: VipBenefitIcon;
  title: string;
  tone: "blue" | "cyan" | "gold";
};

export type VipPackage = {
  duration: string;
  features: string[];
  id: string;
  name: string;
  price: string;
  recommended: boolean;
  sortOrder: number;
};
