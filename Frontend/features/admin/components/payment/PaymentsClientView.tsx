"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Button, Flex, Heading, Select, Table, Text } from "@radix-ui/themes";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

type PlanItem = {
  id: string;
  type: string;
  name: string;
  price: number;
};

type PaymentItem = {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  status: "pending" | "completed" | "failed";
  description: string | null;
  createdAt: string;
  user?: { id: string; fullName: string; email: string };
};

type PaymentStats = {
  totalRevenue: number;
  pendingCount: number;
  completedCount: number;
};

const VIP_AMOUNT = 59000;
const PREMIUM_AMOUNT = 99000;

export function PaymentsClientView() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [payRes, statsRes, plansRes] = await Promise.all([
        fetch("/api/v1/manager/payment"),
        fetch("/api/v1/manager/payment/stats"),
        fetch("/api/v1/subscription/plans"),
      ]);
      if (payRes.ok) setPayments(await payRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (plansRes.ok) {
        const data = await plansRes.json();
        if (Array.isArray(data)) setPlans(data);
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

  const getPlanIdForAmount = (amount: number): string | undefined => {
    // Auto-detect plan from amount
    const numAmount = Number(amount);
    if (numAmount === VIP_AMOUNT) {
      const vip = plans.find((p) => p.type === "vip");
      return vip?.id;
    }
    if (numAmount === PREMIUM_AMOUNT) {
      const premium = plans.find((p) => p.type === "premium");
      return premium?.id;
    }
    return undefined;
  };

  const approvePayment = async (id: string, status: "completed" | "failed", payment?: PaymentItem) => {
    const body: Record<string, string> = { status };
    if (status === "completed" && payment) {
      const planId = getPlanIdForAmount(payment.amount);
      if (planId) body.planId = planId;
    }
    await fetch(`/api/v1/manager/payment/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    fetchData();
  };

  const s = useAdminStyles();
  if (loading) {
    return <Text className={s.payment.loadingText}>Đang tải...</Text>;
  }

  return (
    <Flex direction="column" gap="5">
      <Box>
        <Heading size={{ initial: "5", md: "6" }} className={s.payment.pageHeading}>
          Quản lý nạp tiền
        </Heading>
        <Text as="p" size="2" className={s.payment.descriptionText}>
          Xem lịch sử nạp tiền và duyệt giao dịch. Khi duyệt, VIP sẽ tự động kích hoạt và gắn huy hiệu.
        </Text>
      </Box>

      {/* Stats */}
      {stats && (
        <Flex gap="4" wrap="wrap">
          <StatCard
            label="Tổng doanh thu"
            value={`${Number(stats.totalRevenue).toLocaleString()}đ`}
          />
          <StatCard label="Giao dịch chờ" value={stats.pendingCount} />
          <StatCard label="Đã hoàn tất" value={stats.completedCount} />
        </Flex>
      )}

      {/* Payments table */}
      <Box className={s.payment.tableContainer}>
        <Table.Root>
          <Table.Header>
            <Table.Row className={s.payment.tableHeaderRow}>
              <Table.ColumnHeaderCell>Người dùng</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Số tiền</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Phương thức</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Trạng thái</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Mô tả</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Ngày</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Hành động</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {payments.length === 0 && (
              <Table.Row className={s.payment.tableRow}>
                <Table.Cell colSpan={7}>
                  <Text size="2" className={s.payment.emptyCell}>
                    Chưa có giao dịch nào.
                  </Text>
                </Table.Cell>
              </Table.Row>
            )}
            {payments.map((p) => {
              const planLabel = getPlanIdForAmount(p.amount)
                ? ` (${Number(p.amount) === VIP_AMOUNT ? "VIP" : "Premium"})`
                : "";
              return (
              <Table.Row key={p.id} className={s.payment.tableRow}>
                <Table.Cell>
                  <Text size="2" className={s.payment.primaryText}>
                    {p.user?.fullName || p.user?.email || p.userId}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" weight="bold" className={s.payment.primaryText}>
                    {Number(p.amount).toLocaleString()}đ
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" className={s.payment.secondaryText}>
                    {p.paymentMethod}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <PaymentStatusBadge status={p.status} />
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" className={s.payment.secondaryText}>
                    {p.description || "—"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" className={s.payment.secondaryText}>
                    {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  {p.status === "pending" && (
                    <Flex gap="2" align="center">
                      <Button
                        size="1"
                        color="green"
                        onClick={() => approvePayment(p.id, "completed", p)}
                        className={s.payment.actionButton}
                      >
                        Duyệt{planLabel}
                      </Button>
                      <Button
                        size="1"
                        color="red"
                        variant="soft"
                        onClick={() => approvePayment(p.id, "failed")}
                        className={s.payment.actionButton}
                      >
                        Từ chối
                      </Button>
                    </Flex>
                  )}
                  {p.status === "completed" && planLabel && (
                    <Text size="1" className={s.payment.activatedText}>
                      Đã kích hoạt{planLabel}
                    </Text>
                  )}
                </Table.Cell>
              </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Box>
    </Flex>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  const s = useAdminStyles();
  return (
    <Flex
      direction="column"
      gap="1"
      className={s.payment.statCard}
    >
      <Text size="1" className={s.payment.statLabel}>{label}</Text>
      <Text size="6" weight="bold" className={s.payment.statValue}>{value}</Text>
    </Flex>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, "gray" | "green" | "red" | "amber"> = {
    pending: "amber",
    completed: "green",
    failed: "red",
  };
  return (
    <Badge color={colorMap[status] ?? "gray"} variant="soft">
      {status === "pending" && "Chờ duyệt"}
      {status === "completed" && "Hoàn tất"}
      {status === "failed" && "Thất bại"}
    </Badge>
  );
}
