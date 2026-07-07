"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Flex, Text } from "@radix-ui/themes";
import { CheckIcon, StarIcon } from "@radix-ui/react-icons";
import { SettingsSection } from "./SettingsSection";
import { SeppayPaymentModal } from "@/features/vip/components/SeppayPaymentModal";

type PlanData = {
  id: string;
  type: "vip" | "premium";
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  features: string[];
};

type SubscriptionData = {
  id: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
  plan: PlanData;
};

const benefits = [
  "Giữ hình ảnh đã chia sẻ",
  "Xem họ tên người trò chuyện",
  "Đổi giao diện phòng trò chuyện",
];

export function VipSettingsCard() {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentPlan, setPaymentPlan] = useState<PlanData | null>(null);

  const fetchData = async () => {
    try {
      const [planRes, subRes] = await Promise.all([
        fetch("/api/v1/subscription/plans", { credentials: "include" }),
        fetch("/api/v1/subscription/my", { credentials: "include" }),
      ]);
      if (planRes.ok) {
        const data = await planRes.json();
        if (Array.isArray(data)) setPlans(data);
      }
      if (subRes.ok) {
        const data = await subRes.json();
        if (data) setSubscription(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubscribeClick = (plan: PlanData) => {
    setPaymentPlan(plan);
  };

  const handlePaymentSuccess = () => {
    setPaymentPlan(null);
    fetchData();
  };

  const hasActiveSub = subscription?.status === "active";

  return (
    <SettingsSection
      description="Nâng cấp tài khoản để mở khóa tính năng độc quyền."
      icon={<StarIcon />}
      title="Gói VIP"
    >
      {hasActiveSub && subscription?.plan && (
        <Flex
          align="center"
          gap="2"
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            borderRadius: 8,
            padding: "10px 14px",
          }}
        >
          <Badge color="green" variant="soft">
            Đã kích hoạt
          </Badge>
          <Text size="2" style={{ color: "var(--text-primary)" }}>
            {subscription.plan.name} — hết hạn:{" "}
            {new Date(subscription.endDate).toLocaleDateString("vi-VN")}
          </Text>
        </Flex>
      )}

      <Flex direction="column" gap="2">
        {benefits.map((benefit) => (
          <Flex align="center" gap="2" key={benefit}>
            <CheckIcon color="var(--primary)" />
            <Text size="2" style={{ color: "var(--text-primary)" }}>
              {benefit}
            </Text>
          </Flex>
        ))}
      </Flex>

      {loading ? (
        <Text size="2" style={{ color: "var(--text-secondary)" }}>
          Đang tải gói dịch vụ...
        </Text>
      ) : (
        <Flex gap="2" wrap="wrap">
          {plans.length > 0
            ? plans.map((plan) => {
                const isSubscribed = subscription?.planId === plan.id && hasActiveSub;
                return (
                  <Button
                    key={plan.id}
                    size="2"
                    variant={isSubscribed ? "solid" : "soft"}
                    disabled={isSubscribed}
                    onClick={() => handleSubscribeClick(plan)}
                    style={{ borderRadius: 8 }}
                  >
                    {isSubscribed
                      ? "Đã kích hoạt"
                      : `${plan.name} - ${plan.price.toLocaleString()}đ`}
                  </Button>
                );
              })
            : ["VIP 1 tuần - 19K", "VIP 15 ngày - 35K", "VIP 1 tháng - 59K"].map(
                (label) => (
                  <Button
                    key={label}
                    size="2"
                    variant="soft"
                    disabled
                    style={{ borderRadius: 8 }}
                  >
                    {label}
                  </Button>
                ),
              )}
        </Flex>
      )}

      {/* Seppay Payment Modal */}
      {paymentPlan && (
        <SeppayPaymentModal
          open={!!paymentPlan}
          planId={paymentPlan.id}
          planName={paymentPlan.name}
          onClose={() => setPaymentPlan(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </SettingsSection>
  );
}
