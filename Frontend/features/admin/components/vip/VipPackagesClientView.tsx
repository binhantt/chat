"use client";

import { useState } from "react";
import { Badge, Box, Button, Flex, Grid, Heading, Switch, Text, TextField } from "@radix-ui/themes";
import { CheckIcon, StarIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";

type VipPackage = {
  durationDays: number;
  enabled: boolean;
  id: string;
  name: string;
  price: string;
};

const initialPackages: VipPackage[] = [
  { id: "vip_7_days", name: "VIP 1 tuần", durationDays: 7, price: "0", enabled: true },
  { id: "vip_15_days", name: "VIP 15 ngày", durationDays: 15, price: "0", enabled: true },
  { id: "vip_30_days", name: "VIP 1 tháng", durationDays: 30, price: "0", enabled: true },
];

const VIP_PACKAGES_STORAGE_KEY = "manager.vipPackages";

const vipBenefits = [
  "Giữ được hình ảnh trong cuộc trò chuyện",
  "Xem họ tên người đang trò chuyện",
  "Đổi giao diện theo sở thích",
];

export function VipPackagesClientView() {
  const [packages, setPackages] = useState<VipPackage[]>(() => {
    if (typeof window === "undefined") return initialPackages;

    const raw = window.localStorage.getItem(VIP_PACKAGES_STORAGE_KEY);
    if (!raw) return initialPackages;

    try {
      const savedPackages = JSON.parse(raw) as VipPackage[];
      return Array.isArray(savedPackages) && savedPackages.length > 0 ? savedPackages : initialPackages;
    } catch {
      window.localStorage.removeItem(VIP_PACKAGES_STORAGE_KEY);
      return initialPackages;
    }
  });
  const [saved, setSaved] = useState(false);

  const updatePackage = (id: string, changes: Partial<VipPackage>) => {
    setPackages((items) => items.map((item) => (item.id === id ? { ...item, ...changes } : item)));
    setSaved(false);
  };

  const handleSave = () => {
    window.localStorage.setItem(VIP_PACKAGES_STORAGE_KEY, JSON.stringify(packages));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Flex direction="column" gap="5">
      <Flex align={{ initial: "start", sm: "center" }} direction={{ initial: "column", sm: "row" }} gap="3" justify="between">
        <Box>
          <Heading size={{ initial: "5", md: "6" }} style={{ color: authTheme.text, letterSpacing: 0 }}>
            Quản lý gói VIP
          </Heading>
          <Text as="p" size="2" style={{ color: authTheme.muted, lineHeight: 1.55, margin: "6px 0 0", maxWidth: 720 }}>
            Cấu hình gói VIP cho người dùng. Dữ liệu hiện được lưu tạm trên trình duyệt để chờ nối API thanh toán.
          </Text>
        </Box>
        <Flex align="center" gap="2">
          {saved && (
            <Badge color="green" variant="soft">
              <CheckIcon />
              Đã lưu tạm
            </Badge>
          )}
          <Button onClick={handleSave} style={{ borderRadius: 8 }}>
            <CheckIcon />
            Lưu cấu hình
          </Button>
        </Flex>
      </Flex>

      <Flex
        direction="column"
        gap="3"
        style={{
          background: authTheme.panel,
          border: `1px solid ${authTheme.line}`,
          borderRadius: 8,
          boxShadow: "var(--auth-shadow)",
          padding: 18,
        }}
      >
        <Flex align="center" gap="2" wrap="wrap">
          <StarIcon color="#F59E0B" height={20} width={20} />
          <Heading size="4" style={{ color: authTheme.text, letterSpacing: 0 }}>
            Quyền lợi VIP
          </Heading>
          <Badge color="amber" variant="soft">
            Chưa phát triển đầy đủ
          </Badge>
        </Flex>
        <Grid columns={{ initial: "1", md: "3" }} gap="3">
          {vipBenefits.map((benefit) => (
            <Flex
              align="center"
              gap="2"
              key={benefit}
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.24)",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <CheckIcon color="#D97706" height={16} width={16} />
              <Text size="2" style={{ color: authTheme.text }}>
                {benefit}
              </Text>
            </Flex>
          ))}
        </Grid>
      </Flex>

      <Grid columns={{ initial: "1", lg: "3" }} gap="4">
        {packages.map((pkg) => (
          <Flex
            direction="column"
            gap="4"
            key={pkg.id}
            style={{
              background: authTheme.panel,
              border: `1px solid ${authTheme.line}`,
              borderRadius: 8,
              boxShadow: "var(--auth-shadow)",
              padding: 18,
            }}
          >
            <Flex align="start" gap="3" justify="between">
              <Box>
                <Heading size="4" style={{ color: authTheme.text, letterSpacing: 0 }}>
                  {pkg.name}
                </Heading>
                <Text as="div" size="2" style={{ color: authTheme.muted, marginTop: 4 }}>
                  {pkg.durationDays} ngày sử dụng VIP
                </Text>
              </Box>
              <Badge color={pkg.enabled ? "green" : "gray"} variant="soft">
                {pkg.enabled ? "Đang bật" : "Đang tắt"}
              </Badge>
            </Flex>

            <PackageInput label="Tên gói" onChange={(name) => updatePackage(pkg.id, { name })} value={pkg.name} />
            <PackageInput label="Giá hiển thị" onChange={(price) => updatePackage(pkg.id, { price })} placeholder="VD: 49.000đ" value={pkg.price} />

            <Flex align="center" gap="3" justify="between">
              <Box>
                <Text as="div" size="2" weight="medium" style={{ color: authTheme.text }}>
                  Bật gói
                </Text>
                <Text as="div" size="1" style={{ color: authTheme.muted, marginTop: 3 }}>
                  Cho phép hiển thị gói này ở phía người dùng.
                </Text>
              </Box>
              <Switch checked={pkg.enabled} onCheckedChange={(enabled) => updatePackage(pkg.id, { enabled })} />
            </Flex>
          </Flex>
        ))}
      </Grid>
    </Flex>
  );
}

function PackageInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <Flex direction="column" gap="2">
      <Text size="2" weight="medium" style={{ color: authTheme.text }}>
        {label}
      </Text>
      <TextField.Root onChange={(event) => onChange(event.target.value)} placeholder={placeholder} value={value} style={{ borderRadius: 8 }} />
    </Flex>
  );
}
