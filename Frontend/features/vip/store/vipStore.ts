import type { VipBenefit, VipPackage } from "../types";

const includedFeatures = [
  "Không quảng cáo trong khu vực VIP",
  "Ưu tiên cập nhật tính năng mới",
  "Quyền riêng tư linh hoạt hơn",
];

export const vipBenefits: VipBenefit[] = [
  {
    description: "Hiển thị thông tin nhận diện rõ hơn khi kết nối mới.",
    icon: "identity",
    title: "Xem họ tên người trò chuyện",
    tone: "cyan",
  },
];

export const vipPackages: VipPackage[] = [
  {
    duration: "7 ngày",
    features: includedFeatures,
    id: "vip-7-days",
    name: "VIP 1 tuần",
    price: "19K",
    recommended: false,
    sortOrder: 1,
  },
  {
    duration: "15 ngày",
    features: includedFeatures,
    id: "vip-15-days",
    name: "VIP 15 ngày",
    price: "35K",
    recommended: true,
    sortOrder: 2,
  },
  {
    duration: "30 ngày",
    features: includedFeatures,
    id: "vip-30-days",
    name: "VIP 1 tháng",
    price: "59K",
    recommended: false,
    sortOrder: 3,
  },
];
