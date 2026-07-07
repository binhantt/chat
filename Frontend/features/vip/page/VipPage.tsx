"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Flex, Grid, Text } from "@radix-ui/themes";
import {
  CheckCircledIcon,
  RocketIcon,
  StarFilledIcon,
  LightningBoltIcon,
} from "@radix-ui/react-icons";
import { SeppayPaymentModal } from "@/features/vip/components/SeppayPaymentModal";
import { useAuth } from "@/contexts/AuthContext";

type PlanData = {
  id: string;
  type: "vip" | "premium";
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  features: string[];
  matchPrioritySeconds: number;
};

type SubscriptionData = {
  id: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
  plan: PlanData;
};

const VIP_FEATURES = [
  "Không có quảng cáo",
  "Chọn giới tính để ghép",
  "Chọn quốc gia",
  "Bộ lọc độ tuổi",
  "Tăng tốc ghép đôi",
  "Hiệu ứng đặc biệt",
  "Huy hiệu VIP",
];

const PREMIUM_FEATURES = [
  "Không có quảng cáo",
  "Chọn giới tính để ghép",
  "Chọn quốc gia",
  "Bộ lọc độ tuổi",
  "Tăng tốc ghép đôi",
  "Hiệu ứng đặc biệt",
  "Huy hiệu VIP",
  "Ưu tiên ghép đôi – tìm trong 20 giây",
];

export function VipPage() {
  const { fetchUser } = useAuth();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentPlan, setPaymentPlan] = useState<PlanData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, subRes] = await Promise.all([
          fetch("/api/v1/subscription/plans", { credentials: "include" }),
          fetch("/api/v1/subscription/my", { credentials: "include" }),
        ]);

        if (plansRes.ok) {
          let data: PlanData[];
          try {
            data = await plansRes.json();
          } catch {
            data = [];
          }
          if (Array.isArray(data) && data.length > 0) {
            setPlans(data);
          }
        }
        if (subRes.ok) {
          let data;
          try {
            data = await subRes.json();
          } catch {
            data = null;
          }
          if (data) setSubscription(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = async (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (plan) setPaymentPlan(plan);
  };

  const handlePaymentSuccess = () => {
    setPaymentPlan(null);
    // Refresh user profile to get updated badge (👑) from backend
    fetchUser(true);
    fetch("/api/v1/subscription/my", { credentials: "include" })
      .then((res) => res.ok && res.json())
      .then((data) => { if (data) setSubscription(data); })
      .catch(console.error);
  };

  const handleCancel = async () => {
    if (!subscription) return;
    try {
      await fetch(`/api/v1/subscription/cancel/${subscription.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setSubscription(null);
    } catch (e) {
      console.error(e);
    }
  };

  const hasActiveSub = subscription?.status === "active";

  return (
    <Box style={{ padding: "28px clamp(16px, 2.2vw, 32px)", background: "var(--bg-primary)", minHeight: "100%" }}>
      <Flex direction="column" gap="6" style={{ margin: "0 auto", maxWidth: 1100, width: "100%" }}>
        {/* Hero */}
        <Box
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 50%, var(--secondary) 100%)",
            borderRadius: 20,
            padding: "36px 40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box style={{ position: "absolute", top: -80, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <Box style={{ position: "absolute", bottom: -50, left: "20%", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

          <Flex direction="column" gap="4" style={{ position: "relative", zIndex: 1 }}>
            <Badge
              size="3"
              style={{
                alignSelf: "flex-start",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#FFFFFF",
              }}
            >
              <StarFilledIcon width={14} height={14} /> Nâng cấp trải nghiệm
            </Badge>

            <Text
              size="8"
              weight="bold"
              style={{ color: "#FFFFFF", fontFamily: "var(--font-heading)", lineHeight: 1.1, maxWidth: 600 }}
            >
              {hasActiveSub
                ? `Bạn đang dùng gói ${subscription?.plan?.name || "VIP"}`
                : "Gói VIP cho trải nghiệm trò chuyện cá nhân hóa hơn."}
            </Text>

            <Text
              size="3"
              style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", lineHeight: 1.7, maxWidth: 560 }}
            >
              {hasActiveSub
                ? `Gói của bạn còn hiệu lực đến ${new Date(subscription!.endDate).toLocaleDateString("vi-VN")}.`
                : "Nâng cấp để mở khóa các tính năng đặc biệt: không quảng cáo, ghép đôi thông minh, bộ lọc độ tuổi và nhiều hơn nữa."}
            </Text>

            {hasActiveSub && (
              <Flex gap="3">
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.1)",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Hủy gia hạn
                </button>
              </Flex>
            )}

            <Flex
              align="center"
              gap="3"
              mt="2"
              style={{
                background: hasActiveSub ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "14px 18px",
                maxWidth: 400,
              }}
            >
              <RocketIcon width={18} height={18} style={{ color: hasActiveSub ? "#10B981" : "var(--secondary)" }} />
              <Text size="2" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-body)" }}>
                {hasActiveSub ? "Đã kích hoạt" : "Đăng ký ngay để nhận ưu đãi"}
              </Text>
            </Flex>
          </Flex>
        </Box>

        {/* Plans grid */}
        {loading ? (
          <Text size="3" style={{ color: "var(--chat-muted)", textAlign: "center", padding: 40 }}>
            Đang tải gói dịch vụ...
          </Text>
        ) : plans.length === 0 ? (
          <Flex direction="column" align="center" gap="4" style={{ padding: "60px 20px", textAlign: "center" }}>
            <Box
              style={{
                background: "var(--chat-accent-soft)",
                borderRadius: "50%",
                height: 80,
                width: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <StarFilledIcon width={36} height={36} style={{ color: "var(--chat-accent)" }} />
            </Box>
            <Text size="5" weight="bold" style={{ color: "var(--chat-text)", fontFamily: "var(--font-heading)" }}>
              Chưa có gói VIP
            </Text>
            <Text size="3" style={{ color: "var(--chat-muted)", maxWidth: 400, lineHeight: 1.6 }}>
              Hiện tại chưa có gói VIP nào khả dụng. Hệ thống đang được cập nhật và sẽ sớm mở đăng ký.
            </Text>
          </Flex>
        ) : (
        <Grid columns={{ initial: "1", md: "2" }} gap="5">
          {plans.map((plan) => {
            const isPremium = plan.type === "premium";
            const isSubscribed = subscription?.planId === plan.id && hasActiveSub;

            return (
              <Box
                key={plan.id}
                style={{
                  background: "var(--chat-surface)",
                  border: isSubscribed
                    ? "2px solid var(--chat-accent)"
                    : isPremium
                    ? "2px solid var(--secondary)"
                    : "1px solid var(--chat-border)",
                  borderRadius: 16,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {(isPremium || isSubscribed) && (
                  <Box
                    style={{
                      background: isSubscribed ? "var(--chat-accent)" : "var(--secondary)",
                      color: "#FFFFFF",
                      textAlign: "center",
                      padding: "6px 0",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "var(--font-body)",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {isSubscribed ? "Gói hiện tại" : "Khuyên dùng"}
                  </Box>
                )}
                <Box p="6">
                  <Flex direction="column" gap="4">
                    <Flex align="center" gap="3">
                      <Box
                        style={{
                          background: isPremium
                            ? "linear-gradient(135deg, #F59E0B, #F97316)"
                            : "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
                          borderRadius: 10,
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: 40,
                          width: 40,
                          flexShrink: 0,
                        }}
                      >
                        <StarFilledIcon width={20} height={20} />
                      </Box>
                      <Box>
                        <Text size="5" weight="bold" style={{ color: "var(--chat-text)" }}>
                          Gói {plan.name}
                        </Text>
                        <Text size="2" style={{ color: "var(--chat-muted)" }}>
                          {plan.durationDays} ngày
                        </Text>
                      </Box>
                    </Flex>

                    {plan.description && (
                      <Text size="2" style={{ color: "var(--chat-muted)", lineHeight: 1.6 }}>
                        {plan.description}
                      </Text>
                    )}

                    <Box>
                      <Text size="8" weight="bold" style={{ color: isPremium ? "#F59E0B" : "var(--chat-accent)" }}>
                        {plan.price.toLocaleString()}đ
                      </Text>
                      <Text size="2" style={{ color: "var(--chat-muted)" }}>
                        {" / "}{plan.durationDays} ngày
                      </Text>
                    </Box>

                    <Flex direction="column" gap="2">
                      {plan.features.map((f) => (
                        <Flex key={f} align="center" gap="2">
                          <CheckCircledIcon width={16} height={16} color={isPremium ? "#F59E0B" : "var(--chat-accent)"} />
                          <Text size="2" style={{ color: "var(--chat-text)" }}>{f}</Text>
                        </Flex>
                      ))}
                    </Flex>

                    {isSubscribed ? (
                      <Box
                        style={{
                          textAlign: "center",
                          padding: "12px 0",
                          borderRadius: 10,
                          background: "var(--chat-accent-soft)",
                          color: "var(--chat-accent)",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        Đã kích hoạt
                      </Box>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSubscribe(plan.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          width: "100%",
                          padding: "12px 0",
                          border: "none",
                          borderRadius: 10,
                          background: isPremium
                            ? "linear-gradient(135deg, #F59E0B, #F97316)"
                            : "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
                          color: "#FFFFFF",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "var(--font-body)",
                          cursor: "pointer",
                        }}
                      >
                        <>
                          <RocketIcon width={16} height={16} />
                          Đăng ký ngay
                        </>
                      </button>
                    )}
                  </Flex>
                </Box>
              </Box>
            );
          })}
        </Grid>
        )}

        {/* Features comparison */}
        <Box
          style={{
            background: "var(--chat-surface)",
            border: "1px solid var(--chat-border)",
            borderRadius: 16,
            padding: 28,
          }}
        >
          <Flex direction="column" gap="5">
            <Flex align="center" gap="3">
              <LightningBoltIcon width={20} height={20} style={{ color: "var(--chat-accent)" }} />
              <Text size="4" weight="bold" style={{ color: "var(--chat-text)", fontFamily: "var(--font-heading)" }}>
                So sánh tính năng
              </Text>
            </Flex>

            <Grid columns="3" gap="3" style={{ textAlign: "center" }}>
              <Box />
              <Text size="2" weight="bold" style={{ color: "var(--chat-accent)" }}>VIP</Text>
              <Text size="2" weight="bold" style={{ color: "#F59E0B" }}>Premium</Text>
            </Grid>

            {[
              { name: "Không quảng cáo", vip: true, premium: true },
              { name: "Chọn giới tính ghép", vip: true, premium: true },
              { name: "Chọn quốc gia", vip: true, premium: true },
              { name: "Bộ lọc độ tuổi", vip: true, premium: true },
              { name: "Tăng tốc ghép đôi", vip: true, premium: true },
              { name: "Hiệu ứng đặc biệt", vip: true, premium: true },
              { name: "Huy hiệu VIP", vip: true, premium: true },
              { name: "Ưu tiên ghép (20s)", vip: false, premium: true },
            ].map((row) => (
              <Grid key={row.name} columns="3" gap="3" style={{ textAlign: "center", padding: "6px 0" }}>
                <Text size="2" style={{ color: "var(--chat-text)", textAlign: "left" }}>{row.name}</Text>
                <Text size="2" style={{ color: row.vip ? "var(--chat-accent)" : "var(--chat-muted)" }}>
                  {row.vip ? "✓" : "—"}
                </Text>
                <Text size="2" style={{ color: row.premium ? "#F59E0B" : "var(--chat-muted)" }}>
                  {row.premium ? "✓" : "—"}
                </Text>
              </Grid>
            ))}
          </Flex>
        </Box>

      {/* Footer */}
      <Flex
        direction="column"
        align="center"
        gap="4"
        style={{
          padding: "20px 0 16px",
          borderTop: "1px solid var(--chat-border)",
          marginTop: 8,
        }}
      >
        <Flex align="center" gap="3" wrap="wrap" justify="center">
          <Flex
            align="center"
            gap="2"
            px="3"
            py="2"
            style={{
              background: "var(--chat-accent-soft)",
              borderRadius: 10,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--chat-accent)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--chat-accent-soft)"; e.currentTarget.style.color = "inherit"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <Text size="2">support@nguoila.vn</Text>
          </Flex>
          <Flex
            align="center"
            gap="2"
            px="3"
            py="2"
            style={{
              background: "var(--chat-accent-soft)",
              borderRadius: 10,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--chat-accent)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--chat-accent-soft)"; e.currentTarget.style.color = "inherit"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <Text size="2">1900 1234</Text>
          </Flex>
        </Flex>
        <Text size="1" style={{ color: "var(--chat-muted)" }}>
          &copy; 2026 Người Lạ. Tất cả quyền được bảo lưu.
        </Text>
      </Flex>
      </Flex>

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
    </Box>
  );
}
