"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getCsrfHeaders } from "@/lib/csrf";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Switch,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  BellIcon,
  CheckIcon,
  EnterIcon,
  ExitIcon,
  GearIcon,
  IdCardIcon,
  LockClosedIcon,
  MobileIcon,
  MoonIcon,
  PersonIcon,
  StarIcon,
  SunIcon,
  TrashIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import { SeppayPaymentModal } from "@/features/vip/components/SeppayPaymentModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

/* ===== Section wrapper ===== */
function Section({
  children,
  desc,
  icon,
  title,
}: {
  children: ReactNode;
  desc?: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Box
      style={{
        background: "var(--chat-surface)",
        borderRadius: 14,
        position: "relative",
      }}
    >
      <Box p="5">
        <Flex direction="column" gap="4">
          <Flex align="center" gap="3">
            <Flex
              align="center"
              justify="center"
              style={{
                background: "var(--chat-accent-soft)",
                borderRadius: 8,
                color: "var(--chat-accent)",
                height: 34,
                width: 34,
                flexShrink: 0,
              }}
            >
              {icon}
            </Flex>
            <Box>
              <Text size="3" weight="bold" style={{ color: "var(--chat-text)" }}>{title}</Text>
              {desc && <Text size="1" style={{ color: "var(--chat-muted)", lineHeight: 1.5, marginTop: 1 }}>{desc}</Text>}
            </Box>
          </Flex>
          {children}
        </Flex>
      </Box>
    </Box>
  );
}

/* ===== Read-only field ===== */
function ReadonlyField({ label, value, placeholder = "Chưa cập nhật" }: { label: string; placeholder?: string; value?: string | null }) {
  return (
    <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 200 }}>
      <Text size="1" weight="medium" style={{ color: "var(--chat-muted)" }}>{label}</Text>
      <TextField.Root
        readOnly
        placeholder={placeholder}
        value={value ?? ""}
        style={{
          background: "var(--chat-accent-soft)",
          border: "1px solid var(--chat-border)",
          borderRadius: 8,
          color: "var(--chat-text)",
          cursor: "not-allowed",
        }}
      />
    </Flex>
  );
}

/* ===== Toggle row ===== */
function ToggleRow({
  checked, defaultChecked, desc, onCheckedChange, title,
}: {
  checked?: boolean; defaultChecked?: boolean; desc: string; onCheckedChange?: (v: boolean) => void; title: string;
}) {
  return (
    <Flex align="center" justify="between" gap="4" style={{ paddingBottom: 12 }}>
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" style={{ color: "var(--chat-text)" }}>{title}</Text>
        <Text size="1" style={{ color: "var(--chat-muted)" }}>{desc}</Text>
      </Flex>
      <Switch checked={checked} defaultChecked={defaultChecked} color="violet" onCheckedChange={onCheckedChange} />
    </Flex>
  );
}

/* ===== Danger zone ===== */
function DangerZone({ deleting, onDelete, onLogout }: { deleting: boolean; onDelete: () => void; onLogout: () => void }) {
  return (
    <Section icon={<TrashIcon width={16} height={16} />} title="Vùng nguy hiểm">
      <Flex direction={{ initial: "column", sm: "row" }} gap="3">
        <Button size="3" variant="outline" onClick={onLogout} style={{ borderColor: "var(--chat-border)", borderRadius: 10, flex: 1 }}>
          <ExitIcon /> Đăng xuất
        </Button>
        <Button color="red" disabled={deleting} onClick={onDelete} size="3" style={{ borderRadius: 10, flex: 1 }}>
          <TrashIcon /> {deleting ? "Đang xóa..." : "Xóa tài khoản"}
        </Button>
      </Flex>
      <Text size="1" style={{ color: "var(--chat-muted)", lineHeight: 1.5 }}>
        Khi xóa tài khoản, hồ sơ, tin nhắn, lịch sử ghép đôi và báo cáo liên quan sẽ bị xóa.
      </Text>
    </Section>
  );
}

/* ===== VIP card ===== */
type PlanData = {
  id: string;
  type: "vip" | "premium";
  name: string;
  price: number;
  durationDays: number;
};
type SubData = { id: string; planId: string; status: string; endDate: string; plan: PlanData };

function VipCard() {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [sub, setSub] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentPlan, setPaymentPlan] = useState<PlanData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/subscription/plans", { credentials: "include" }),
      fetch("/api/v1/subscription/my", { credentials: "include" }),
    ]).then(async ([planRes, subRes]) => {
      if (planRes.ok) { const data = await planRes.json(); if (Array.isArray(data)) setPlans(data); }
      if (subRes.ok) { const data = await subRes.json(); if (data) setSub(data); }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const benefits = ["Xem họ tên người trò chuyện"];
  const active = sub?.status === "active";

  return (
    <Section icon={<StarIcon width={16} height={16} />} title="Gói VIP">
      {active && sub?.plan && (
        <Flex align="center" gap="3" style={{ background: "rgba(16,185,129,0.1)", borderRadius: 8, padding: "10px 14px" }}>
          <Badge color="green" variant="soft">Đã kích hoạt</Badge>
          <Text size="2" style={{ color: "var(--chat-text)" }}>
            {sub.plan.name} — hết hạn: {new Date(sub.endDate).toLocaleDateString("vi-VN")}
          </Text>
        </Flex>
      )}
      <Flex direction="column" gap="2">
        {benefits.map((b) => (
          <Flex key={b} align="center" gap="2">
            <CheckIcon width={14} height={14} color="var(--chat-accent)" />
            <Text size="2" style={{ color: "var(--chat-text)" }}>{b}</Text>
          </Flex>
        ))}
      </Flex>
      {loading ? (
        <Text size="2" style={{ color: "var(--chat-muted)" }}>Đang tải...</Text>
      ) : (
        <Flex gap="2" wrap="wrap">
          {plans.length > 0
            ? plans.map((plan) => {
                const isSubd = sub?.planId === plan.id && active;
                return (
                  <Button
                    key={plan.id} size="2"
                    variant={isSubd ? "solid" : "soft"}
                    disabled={isSubd}
                    onClick={() => setPaymentPlan(plan)}
                    style={{ borderRadius: 8 }}
                  >
                    {isSubd ? "Đã kích hoạt" : `${plan.name} - ${plan.price.toLocaleString()}đ`}
                  </Button>
                );
              })
            : ["VIP 1 tuần", "VIP 15 ngày", "VIP 1 tháng"].map((v) => (
                <Button key={v} size="2" variant="soft" disabled style={{ borderRadius: 8 }}>{v}</Button>
              ))}
        </Flex>
      )}

      {paymentPlan && (
        <SeppayPaymentModal
          open={!!paymentPlan}
          planId={paymentPlan.id}
          planName={paymentPlan.name}
          onClose={() => setPaymentPlan(null)}
          onSuccess={() => { setPaymentPlan(null); fetch("/api/v1/subscription/my", { credentials: "include" }).then(r => r.ok && r.json()).then(d => d && setSub(d)).catch(() => {}); }}
        />
      )}
    </Section>
  );
}

/* ===== Avatar selector ===== */
function AvatarSelector() {
  const avatars = [
    { color: "#4B2E83", label: "A" },
    { color: "#22D3EE", label: "B" },
    { color: "#F59E0B", label: "C" },
    { color: "#14B8A6", label: "D" },
    { color: "#8B5CF6", label: "E" },
    { color: "#EF4444", label: "F" },
  ];
  const [selected, setSelected] = useState(avatars[0]);

  return (
    <Section icon={<PersonIcon width={16} height={16} />} title="Màu đại diện">
      <Flex align="center" gap="5" wrap="wrap">
        <Flex align="center" justify="center" style={{ background: "var(--chat-accent-soft)", borderRadius: 16, height: 100, width: 100, flexShrink: 0 }}>
          <Avatar fallback={selected.label} radius="full" size="6" style={{ background: selected.color, color: "#FFFFFF", boxShadow: "0 4px 16px rgba(75,46,131,0.18)" }} />
        </Flex>
        <Flex direction="column" gap="2" style={{ flex: 1 }}>
          <Text size="2" weight="medium" style={{ color: "var(--chat-text)" }}>Chọn màu nền đại diện</Text>
          <Flex gap="2" wrap="wrap">
            {avatars.map((a) => (
              <Box
                key={a.label}
                onClick={() => setSelected(a)}
                role="button"
                aria-label={`Chọn avatar ${a.label}`}
                style={{
                  background: a.color,
                  border: selected.label === a.label ? "3px solid var(--chat-text)" : "3px solid transparent",
                  borderRadius: "50%",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                  height: 40,
                  width: 40,
                  transition: "all 0.15s ease",
                  boxShadow: selected.label === a.label ? "0 2px 8px rgba(75,46,131,0.2)" : "none",
                }}
              >
                {a.label}
              </Box>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Section>
  );
}

/* ===== Status panel ===== */
function StatusPanel({ icon, items, title }: { icon: ReactNode; items: string[]; title: string }) {
  return (
    <Box style={{ background: "var(--chat-surface)", borderRadius: 14, padding: 18 }}>
      <Flex direction="column" gap="3">
        <Flex align="center" gap="2">
          <Box style={{ color: "var(--chat-accent)" }}>{icon}</Box>
          <Text size="3" weight="bold" style={{ color: "var(--chat-text)" }}>{title}</Text>
        </Flex>
        <Flex direction="column" gap="2">
          {items.map((item) => (
            <Flex key={item} align="center" gap="2">
              <Box style={{ background: "var(--chat-accent)", borderRadius: 999, height: 6, width: 6, flexShrink: 0 }} />
              <Text size="2" style={{ color: "var(--chat-muted)" }}>{item}</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}

/* ===== Tip card ===== */
function TipCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Box style={{ background: "var(--chat-surface)", borderRadius: 14, padding: 18 }}>
      <Flex direction="column" gap="2">
        <Text size="3" weight="bold" style={{ color: "var(--chat-text)" }}>{title}</Text>
        <Text size="2" style={{ color: "var(--chat-muted)", lineHeight: 1.6 }}>{desc}</Text>
      </Flex>
    </Box>
  );
}

/* ===== Support card ===== */
function SupportCard() {
  return (
    <Section icon={<MobileIcon width={16} height={16} />} title="Hỗ trợ" desc="Liên hệ khi cần giúp đỡ">
      <Flex direction="column" gap="3">
        <Flex
          align="center"
          gap="3"
          style={{
            background: "var(--chat-accent-soft)",
            border: "1px solid var(--chat-border)",
            borderRadius: 10,
            padding: "12px 14px",
          }}
        >
          <Flex
            align="center"
            justify="center"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              borderRadius: 8,
              color: "#FFFFFF",
              height: 36,
              width: 36,
              flexShrink: 0,
            }}
          >
            <MobileIcon width={16} height={16} />
          </Flex>
          <Flex direction="column" gap="0">
            <Text size="1" style={{ color: "var(--chat-muted)" }}>Hotline</Text>
            <Text size="2" weight="bold" style={{ color: "var(--chat-text)" }}>0329 104 253</Text>
          </Flex>
        </Flex>

        <a
          href="https://cv-binh-an.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <Flex
            align="center"
            gap="3"
            style={{
              background: "var(--chat-accent-soft)",
              border: "1px solid var(--chat-border)",
              borderRadius: 10,
              padding: "12px 14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--chat-accent)";
              e.currentTarget.style.background = "rgba(79, 70, 229, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--chat-border)";
              e.currentTarget.style.background = "var(--chat-accent-soft)";
            }}
          >
            <Flex
              align="center"
              justify="center"
              style={{
                background: "linear-gradient(135deg, #0068ff, #0047b3)",
                borderRadius: 8,
                color: "#FFFFFF",
                height: 36,
                width: 36,
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
              </svg>
            </Flex>
            <Flex direction="column" gap="0" style={{ flex: 1 }}>
              <Text size="1" style={{ color: "var(--chat-muted)" }}>Zalo Hỗ trợ</Text>
              <Text size="2" weight="bold" style={{ color: "var(--chat-text)" }}>Nhắn tin trên Zalo</Text>
            </Flex>
            <ExternalLinkIcon width={14} height={14} style={{ color: "var(--chat-muted)" }} />
          </Flex>
        </a>
      </Flex>
    </Section>
  );
}

/* ===== Main settings page ===== */
export function SettingsPage() {
  const { setThemeMode, theme } = useTheme();
  const { user, logout } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const isDark = theme === "dark";

  const handleDeleteAccount = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản và toàn bộ dữ liệu liên quan không?")) return;
    if (window.prompt("Nhập XOA để xác nhận xóa vĩnh viễn tài khoản") !== "XOA") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/v1/users/me", { credentials: "include", method: "DELETE", headers: { ...getCsrfHeaders() } });
      if (!res.ok) {
        const err = await res.json().catch(() => null) as { message?: string } | null;
        window.alert(err?.message || "Không thể xóa tài khoản");
        return;
      }
      window.location.href = "/login";
    } catch {
      window.alert("Không thể xóa tài khoản");
    } finally {
      setDeleting(false);
    }
  };

  const fmtGender = (g?: string | null) => g === "male" ? "Nam" : g === "female" ? "Nữ" : g === "other" ? "Khác" : "";
  const fmtCity = (c?: string | null) => c === "TP. Ho Chi Minh" ? "TP. Hồ Chí Minh" : c === "Ha Noi" ? "Hà Nội" : c || "";

  return (
    <Box style={{ padding: "28px clamp(16px, 2.2vw, 32px)", background: "var(--bg-primary)", minHeight: "100%" }}>
      <Flex direction="column" gap="5" style={{ margin: "0 auto", maxWidth: 1100, width: "100%" }}>

        {/* Hero */}
        <Box style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light), var(--secondary))", borderRadius: 20, padding: "32px 36px", position: "relative", overflow: "hidden" }}>
          <Box style={{ position: "absolute", top: -60, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <Flex direction="column" gap="4" style={{ position: "relative", zIndex: 1 }}>
            <Badge size="3" style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFFFFF" }}>
              <GearIcon width={14} height={14} /> Cài đặt tài khoản
            </Badge>
            <Text size="7" weight="bold" style={{ color: "#FFFFFF", fontFamily: "var(--font-heading)", lineHeight: 1.1, maxWidth: 500 }}>
              Điều chỉnh tài khoản gọn gàng hơn.
            </Text>
            <Text size="3" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", lineHeight: 1.7, maxWidth: 540 }}>
              Quản lý thông tin, tùy chọn nhanh và các thao tác bảo mật trong một bố cục sạch, dễ quét và không loằng ngoằng.
            </Text>
            <Flex gap="4" mt="1">
              <Metric icon={<PersonIcon width={16} height={16} />} label="Hồ sơ" value="Đồng bộ" />
              <Metric icon={<BellIcon width={16} height={16} />} label="Thông báo" value="Bật" />
              <Metric icon={<LockClosedIcon width={16} height={16} />} label="Bảo mật" value="Riêng" />
            </Flex>
          </Flex>
        </Box>

        {/* Two-column layout */}
        <Grid columns={{ initial: "1", lg: "2" }} gap="5" style={{ alignItems: "start" }}>
          {/* Left column: form sections */}
          <Flex direction="column" gap="4">
            {/* Account info */}
            <Section icon={<IdCardIcon width={16} height={16} />} title="Thông tin tài khoản">
              <Grid columns={{ initial: "1", sm: "2" }} gap="3">
                <ReadonlyField label="Tên hiển thị" value={user?.fullName} />
                <ReadonlyField label="Email" value={user?.email} />
                <ReadonlyField label="Số điện thoại" value={user?.phoneNumber} />
                <ReadonlyField label="Thành phố" value={fmtCity(user?.city)} />
                <ReadonlyField label="Giới tính" value={fmtGender(user?.gender)} />
                <ReadonlyField label="Giới thiệu" value={user?.bio} />
              </Grid>
              <Button disabled size="3" style={{ background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))", borderRadius: 10, color: "#FFFFFF", width: "100%", cursor: "not-allowed", opacity: 0.7 }}>
                <EnterIcon /> Lưu cài đặt
              </Button>
            </Section>

            {/* Preferences */}
            <Section icon={<BellIcon width={16} height={16} />} title="Tùy chọn">
              <Flex direction="column" gap="3">
                <ToggleRow defaultChecked desc="Nhận thông báo khi có tin nhắn mới" title="Nhận thông báo" />
                <ToggleRow checked={isDark} desc="Bật hoặc tắt giao diện tối" title="Chế độ tối" onCheckedChange={(v) => setThemeMode(v ? "dark" : "light")} />
                <ToggleRow defaultChecked desc="Phát âm thanh khi nhận tin nhắn" title="Âm thanh" />
              </Flex>
            </Section>

            {/* VIP */}
            <VipCard />

            {/* Danger zone */}
            <DangerZone deleting={deleting} onDelete={handleDeleteAccount} onLogout={logout} />
          </Flex>

          {/* Right column: sidebar panels */}
          <Flex direction="column" gap="4">
            <AvatarSelector />
            <SupportCard />
            <StatusPanel icon={<CheckIcon width={18} height={18} />} items={[
              "Thông tin hồ sơ đang được đồng bộ",
              "Tùy chọn nhanh được lưu trên thiết bị",
              "Khu vực nguy hiểm đã tách riêng",
            ]} title="Trạng thái cài đặt" />
            <StatusPanel icon={<StarIcon width={18} height={18} />} items={[
              "VIP đã kết nối với API thanh toán",
              "Avatar chỉ là xem trước giao diện",
              "Cập nhật hồ sơ tại tab Cá nhân",
            ]} title="Ghi chú nhanh" />
            <TipCard
              title="Gợi ý"
              desc="Muốn sửa tên, thành phố hoặc giới thiệu, hãy cập nhật trong tab Cá nhân để đồng bộ với hồ sơ trò chuyện."
            />
          </Flex>
        </Grid>
      </Flex>
    </Box>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Flex align="center" gap="2" style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", flex: 1 }}>
      <Box style={{ color: "rgba(255,255,255,0.7)" }}>{icon}</Box>
      <Box>
        <Text as="div" size="1" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</Text>
        <Text as="div" size="2" weight="bold" style={{ color: "#FFFFFF" }}>{value}</Text>
      </Box>
    </Flex>
  );
}
