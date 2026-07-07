"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Button, Flex, Grid, Heading, Table, Text, TextField, Dialog } from "@radix-ui/themes";
import { CheckIcon, PlusIcon, StarIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

type PlanItem = {
  id: string;
  type: "vip" | "premium";
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  features: string[];
  matchPrioritySeconds: number;
  isActive: boolean;
};

const ALL_FEATURES = [
  "Không có quảng cáo",
  "Chọn giới tính để ghép",
  "Chọn quốc gia",
  "Bộ lọc độ tuổi",
  "Tăng tốc ghép đôi",
  "Hiệu ứng đặc biệt",
  "Huy hiệu VIP",
  "Ưu tiên ghép đôi – tìm trong 20 giây",
];

export function VipPackagesClientView() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PlanItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/v1/manager/subscription/plans", { credentials: "include" });
      if (res.ok) setPlans(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const savePlan = async (plan: Partial<PlanItem>) => {
    setSaving(true);
    setError(null);
    try {
      const { id, ...body } = plan;
      let res;
      if (id) {
        res = await fetch(`/api/v1/manager/subscription/plans/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include",
        });
      } else {
        res = await fetch("/api/v1/manager/subscription/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include",
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Lỗi không xác định" }));
        setError(err.message || "Không thể lưu gói");
        return;
      }

      setEditing(null);
      setShowCreate(false);
      fetchPlans();
    } catch (e) {
      console.error(e);
      setError("Lỗi kết nối đến server");
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Xóa gói này?")) return;
    try {
      await fetch(`/api/v1/manager/subscription/plans/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };

  const s = useAdminStyles();
  if (loading) {
    return <Text className={s.vip.loadingText}>Đang tải...</Text>;
  }

  return (
    <Flex direction="column" gap="5">
      <Flex align={{ initial: "start", sm: "center" }} direction={{ initial: "column", sm: "row" }} gap="3" justify="between">
        <Box>
          <Heading size={{ initial: "5", md: "6" }} className={s.vip.pageHeading}>
            Quản lý gói dịch vụ
          </Heading>
          <Text as="p" size="2" className={s.vip.descriptionText}>
            Tạo và quản lý gói VIP, Premium.
          </Text>
        </Box>
        <Button onClick={() => setShowCreate(true)} className={s.vip.actionButton}>
          <PlusIcon /> Tạo gói mới
        </Button>
      </Flex>

      {error && (
        <Box className={s.vip.errorBox}>
          <Text size="2" className={s.vip.errorText}>{error}</Text>
        </Box>
      )}

      <Flex direction="column" gap="3" className={s.vip.featuresSection}>
        <Flex align="center" gap="2" className={s.vip.featuresHeader}>
          <StarIcon color="#F59E0B" height={20} width={20} />
          <Heading size="4" className={s.vip.featuresTitle}>Tất cả tính năng</Heading>
        </Flex>
        <Grid columns={{ initial: "2", md: "4" }} gap="2">
          {ALL_FEATURES.map((f) => (
            <Flex align="center" gap="2" key={f} className={s.vip.featureItem}>
              <CheckIcon color="var(--chat-success)" height={16} width={16} />
              <Text size="2" className={s.vip.featureName}>{f}</Text>
            </Flex>
          ))}
        </Grid>
      </Flex>

      <Grid columns={{ initial: "1", lg: "2" }} gap="4">
        {plans.map((plan) => (
          <Flex direction="column" key={plan.id} className={s.vip.planCard}>
            <Flex align="start" justify="between" className={s.vip.planCardHeader}>
              <Box>
                <Heading size="4" className={s.vip.planName}>{plan.name}</Heading>
                <Flex align="center" gap="2" mt="2">
                  <Text size="6" weight="bold" className={s.vip.planPrice}>
                    {plan.price.toLocaleString()}đ
                  </Text>
                  <Text size="2" className={s.vip.planDuration}>
                    / {plan.durationDays} ngày
                  </Text>
                  <Badge color={plan.isActive ? "green" : "gray"} variant="soft" size="1">
                    {plan.isActive ? "Đang bán" : "Tạm tắt"}
                  </Badge>
                </Flex>
              </Box>
              <Flex gap="2" align="center">
                <button type="button" onClick={() => setEditing(plan)} className={s.vip.iconButtonSecondary}>
                  <Pencil1Icon width={16} height={16} />
                </button>
                <button type="button" onClick={() => deletePlan(plan.id)} className={s.vip.iconButtonDanger}>
                  <TrashIcon width={16} height={16} />
                </button>
              </Flex>
            </Flex>
            {plan.description && (
              <Box className={s.vip.planDescription}>
                <Text size="2" className={s.vip.planDescriptionText}>{plan.description}</Text>
              </Box>
            )}
            <Box className={s.vip.planFeatures}>
              <Text size="1" weight="bold" className={s.vip.planFeaturesLabel}>
                Tính năng
              </Text>
              <Flex wrap="wrap" gap="2" mt="2">
                {plan.features.map((f) => (
                  <Badge key={f} color="purple" variant="soft" size="1">{f}</Badge>
                ))}
              </Flex>
            </Box>
          </Flex>
        ))}
        {plans.length === 0 && (
          <Text size="2" className={s.vip.emptyPlans}>
            Chưa có gói nào.
          </Text>
        )}
      </Grid>

      <PlanDialog
        plan={editing}
        open={!!editing || showCreate}
        saving={saving}
        onClose={() => { setEditing(null); setShowCreate(false); setError(null); }}
        onSave={savePlan}
      />

      {/* ─── Subscriber list ─── */}
      <SubscriberList />
    </Flex>
  );
}

/* ===== Subscriber list ===== */
type SubItem = {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  plan: { id: string; name: string; type: string; price: number };
  user: { id: string; fullName: string; email: string; badge?: string | null };
};

function SubscriberList() {
  const s = useAdminStyles();
  const [subs, setSubs] = useState<SubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/manager/subscription/users", { credentials: "include" });
      if (res.ok) setSubs(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubs(); }, []);

  const cancelSub = async (id: string, userName: string) => {
    if (!window.confirm(`Xóa gói đăng ký của ${userName}?`)) return;
    try {
      const res = await fetch(`/api/v1/manager/subscription/users/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) fetchSubs();
    } catch (e) { console.error(e); }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, "green" | "red" | "amber"> = { active: "green", expired: "red", cancelled: "amber" };
    const labels: Record<string, string> = { active: "Hoạt động", expired: "Hết hạn", cancelled: "Đã hủy" };
    return <Badge color={colors[status] ?? "gray"} variant="soft">{labels[status] || status}</Badge>;
  };

  // Separate active vs history
  const activeSubs = subs.filter((s) => s.status === "active");
  const historySubs = subs.filter((s) => s.status !== "active");

  return (
    <Box>
      <Flex align="center" justify="between" mb="4">
        <Box>
          <Heading size={{ initial: "5", md: "6" }} className={s.vip.subListTitle}>
            Người đăng ký
          </Heading>
          <Text as="p" size="2" className={s.vip.subListDesc}>
            Danh sách người dùng đã đăng ký gói dịch vụ.
          </Text>
        </Box>
        <Button variant="soft" onClick={fetchSubs} disabled={loading} className={s.vip.actionButton}>
          {loading ? "Đang tải..." : "Làm mới"}
        </Button>
      </Flex>

      {/* Active subscriptions */}
      <Box className={`${s.vip.subSection} ${s.vip.subSectionBottomMargin}`}>
        <Flex align="center" gap="2" className={s.vip.subSectionHeader}>
          <Box className={s.vip.greenDot} />
          <Heading size="3" className={s.vip.subSectionTitle}>Đang hoạt động</Heading>
          <Badge color="green" variant="soft" size="1">{activeSubs.length}</Badge>
        </Flex>
        {activeSubs.length === 0 && !loading && (
          <Flex align="center" justify="center" className={s.vip.emptyState}>
            <Text size="2" className={s.vip.emptyText}>Chưa có người đăng ký nào.</Text>
          </Flex>
        )}
        {activeSubs.length > 0 && (
          <Table.Root>
            <Table.Header>
              <Table.Row className={s.vip.tableHeaderRow}>
                <Table.ColumnHeaderCell>Người dùng</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Gói</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Ngày bắt đầu</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Ngày hết hạn</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Còn lại</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Hành động</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {activeSubs.map((sub) => {
                const daysLeft = Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <Table.Row key={sub.id} className={s.vip.tableRow}>
                    <Table.Cell>
                      <Flex align="center" gap="2">
                        <Text size="2" weight="bold" className={s.vip.primaryText}>
                          {sub.user?.fullName || sub.user?.email || sub.userId}
                        </Text>
                        {(sub.user?.badge || sub.plan?.type === "vip") && (
                          <Text>{sub.user?.badge || "👑"}</Text>
                        )}
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex align="center" gap="2">
                        <Badge color="purple" variant="solid" size="1">
                          {sub.plan?.name || sub.planId}
                        </Badge>
                        <Text size="1" weight="medium" className={s.vip.secondaryText}>
                          {Number(sub.plan?.price || 0).toLocaleString()}đ
                        </Text>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{new Date(sub.startDate).toLocaleDateString("vi-VN")}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{new Date(sub.endDate).toLocaleDateString("vi-VN")}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={daysLeft <= 3 ? "red" : "green"} variant="soft" size="1">
                        {daysLeft > 0 ? `${daysLeft} ngày` : "Hôm nay"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Button size="1" color="red" variant="soft"
                        onClick={() => cancelSub(sub.id, sub.user?.fullName || sub.user?.email || "")}
                        className={`${s.vip.actionButton} ${s.vip.smallActionButton}`}>
                        Hủy
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        )}
      </Box>

      {/* History (cancelled/expired) */}
      {historySubs.length > 0 && (
        <Box className={s.vip.subSection}>
          <Flex align="center" gap="2" className={s.vip.subSectionHeader}>
            <Box className={s.vip.grayDot} />
            <Heading size="3" className={s.vip.subSectionTitle}>Lịch sử</Heading>
            <Badge color="gray" variant="soft" size="1">{historySubs.length}</Badge>
          </Flex>
          <Table.Root>
            <Table.Header>
              <Table.Row className={s.vip.tableHeaderRow}>
                <Table.ColumnHeaderCell>Người dùng</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Gói</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Trạng thái</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Ngày bắt đầu</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Ngày hết hạn</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {historySubs.map((sub) => (
                <Table.Row key={sub.id} className={s.vip.historyRow}>
                  <Table.Cell>
                    <Flex align="center" gap="2">
                      <Text size="2" className={s.vip.primaryText}>
                        {sub.user?.fullName || sub.user?.email || sub.userId}
                      </Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="gray" variant="soft" size="1">{sub.plan?.name || sub.planId}</Badge>
                  </Table.Cell>
                  <Table.Cell>{statusBadge(sub.status)}</Table.Cell>
                  <Table.Cell><Text size="2">{new Date(sub.startDate).toLocaleDateString("vi-VN")}</Text></Table.Cell>
                  <Table.Cell><Text size="2">{new Date(sub.endDate).toLocaleDateString("vi-VN")}</Text></Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {loading && (
        <Flex align="center" justify="center" className={s.vip.loadingContainer}>
          <Text size="2" className={s.vip.emptyText}>Đang tải...</Text>
        </Flex>
      )}
    </Box>
  );
}

function PlanDialog({ plan, open, saving, onClose, onSave }: {
  plan: PlanItem | null; open: boolean; saving: boolean;
  onClose: () => void; onSave: (data: Partial<PlanItem>) => void;
}) {
  const s = useAdminStyles();
  const [type, setType] = useState<"vip" | "premium">(plan?.type ?? "vip");
  const [name, setName] = useState(plan?.name ?? "");
  const [price, setPrice] = useState(String(plan?.price ?? 59000));
  const [duration, setDuration] = useState(String(plan?.durationDays ?? 30));
  const [desc, setDesc] = useState(plan?.description ?? "");
  const [features, setFeatures] = useState<string[]>(plan?.features ?? []);

  useEffect(() => {
    if (open) {
      setType(plan?.type ?? "vip");
      setName(plan?.name ?? "");
      setPrice(String(plan?.price ?? 59000));
      setDuration(String(plan?.durationDays ?? 30));
      setDesc(plan?.description ?? "");
      setFeatures(plan?.features ?? []);
    }
  }, [plan, open]);

  const toggleFeature = (f: string) => {
    setFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Content className={s.vip.planDialogContent}>
        <Dialog.Title>{plan ? "Sửa gói" : "Tạo gói mới"}</Dialog.Title>
        <Flex direction="column" gap="4" mt="3">
          <Flex gap="3">
            <Box className={s.vip.flex1}>
              <Text size="2" weight="medium" className={s.vip.fieldLabel}>Loại</Text>
              <select value={type} onChange={(e) => setType(e.target.value as any)}
                className={s.vip.selectField}>
                <option value="vip">VIP</option>
                <option value="premium">Premium</option>
              </select>
            </Box>
            <Box className={s.vip.flex2}>
              <Text size="2" weight="medium" className={s.vip.fieldLabel}>Tên</Text>
              <TextField.Root value={name} onChange={(e) => setName(e.target.value)} placeholder="VIP" className={s.vip.textField} />
            </Box>
          </Flex>
          <Flex gap="3">
            <Box className={s.vip.flex1}>
              <Text size="2" weight="medium" className={s.vip.fieldLabel}>Giá (VNĐ)</Text>
              <TextField.Root value={price} onChange={(e) => setPrice(e.target.value)} placeholder="59000" className={s.vip.textField} />
            </Box>
            <Box className={s.vip.flex1}>
              <Text size="2" weight="medium" className={s.vip.fieldLabel}>Số ngày</Text>
              <TextField.Root value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30" className={s.vip.textField} />
            </Box>
          </Flex>
          <Box>
            <Text size="2" weight="medium" className={s.vip.fieldLabel}>Mô tả</Text>
            <TextField.Root value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Mô tả..." className={s.vip.textField} />
          </Box>
          <Box>
            <Text size="2" weight="medium" className={s.vip.fieldLabelBottom}>Tính năng</Text>
            <Flex wrap="wrap" gap="2">
              {ALL_FEATURES.map((f) => {
                const sel = features.includes(f);
                return (
                  <button key={f} type="button" onClick={() => toggleFeature(f)}
                    className={sel ? s.vip.featureToggleSelected : s.vip.featureToggle}>
                    {sel && <CheckIcon width={14} height={14} />}{f}
                  </button>
                );
              })}
            </Flex>
          </Box>
          <Flex gap="3" mt="3" justify="end">
            <Button variant="soft" onClick={onClose} className={s.vip.actionButton}>Hủy</Button>
            <Button onClick={() => onSave({
              type, name, price: Number(price), durationDays: Number(duration),
              description: desc || undefined, features, isActive: true,
              matchPrioritySeconds: type === "premium" ? 20 : 30,
              ...(plan ? { id: plan.id } : {}),
            })} disabled={saving || !name || !price} className={s.vip.actionButton}>
              {saving ? "Đang lưu..." : (plan ? "Cập nhật" : "Tạo gói")}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
