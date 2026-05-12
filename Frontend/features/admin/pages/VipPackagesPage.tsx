"use client";

import { Badge, Box, Button, Card, Flex, Heading, Switch, Text, TextField } from "@radix-ui/themes";
import { CheckIcon, StarIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

interface VipPackage {
  id: string;
  name: string;
  durationDays: number;
  price: string;
  enabled: boolean;
}

const initialPackages: VipPackage[] = [
  { id: "vip_7_days", name: "VIP 1 tuần", durationDays: 7, price: "0", enabled: true },
  { id: "vip_15_days", name: "VIP 15 ngày", durationDays: 15, price: "0", enabled: true },
  { id: "vip_30_days", name: "VIP 1 tháng", durationDays: 30, price: "0", enabled: true },
];

const VIP_PACKAGES_STORAGE_KEY = "admin.vipPackages";

const vipBenefits = [
  "Giữ được hình ảnh",
  "Xem được họ và tên người chat",
  "Đổi được giao diện",
];

export function VipPackagesPage() {
  const [packages, setPackages] = useState<VipPackage[]>(initialPackages);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(VIP_PACKAGES_STORAGE_KEY);
    if (!raw) return;

    try {
      const savedPackages = JSON.parse(raw) as VipPackage[];
      if (Array.isArray(savedPackages) && savedPackages.length > 0) {
        setPackages(savedPackages);
      }
    } catch {
      window.localStorage.removeItem(VIP_PACKAGES_STORAGE_KEY);
    }
  }, []);

  const updatePackage = (id: string, changes: Partial<VipPackage>) => {
    setPackages((items) => items.map((item) => item.id === id ? { ...item, ...changes } : item));
    setSaved(false);
  };

  const handleSave = () => {
    window.localStorage.setItem(VIP_PACKAGES_STORAGE_KEY, JSON.stringify(packages));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Flex direction="column" gap="5">
      <Flex justify="between" align="center" wrap="wrap" gap="3">
        <Flex direction="column" gap="1">
          <Heading size="6">Quản lý gói VIP</Heading>
          <Text size="2" color="gray">
            Cấu hình 3 gói VIP cho người dùng. Tính năng VIP đang ở trạng thái chưa phát triển.
          </Text>
        </Flex>
        <Flex align="center" gap="2">
          {saved && (
            <Flex align="center" gap="1">
              <CheckIcon width={14} height={14} color="var(--green-9)" />
              <Text size="2" color="green">Đã lưu tạm</Text>
            </Flex>
          )}
          <Button onClick={handleSave}>
            <CheckIcon width={16} height={16} />
            Lưu cấu hình
          </Button>
        </Flex>
      </Flex>

      <Card size="2">
        <Flex direction="column" gap="3">
          <Flex align="center" gap="2">
            <StarIcon width={20} height={20} color="var(--amber-9)" />
            <Heading size="4">Quyền lợi VIP</Heading>
            <Badge color="amber" variant="soft">Chưa phát triển</Badge>
          </Flex>
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {vipBenefits.map((benefit) => (
              <Flex
                key={benefit}
                align="center"
                gap="2"
                p="3"
                style={{
                  border: "1px solid var(--amber-5)",
                  background: "var(--amber-2)",
                  borderRadius: 8,
                }}
              >
                <CheckIcon width={16} height={16} color="var(--amber-10)" />
                <Text size="2">{benefit}</Text>
              </Flex>
            ))}
          </Box>
        </Flex>
      </Card>

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {packages.map((pkg) => (
          <Card key={pkg.id} size="2">
            <Flex direction="column" gap="4">
              <Flex justify="between" align="start" gap="3">
                <Flex direction="column" gap="1">
                  <Heading size="4">{pkg.name}</Heading>
                  <Text size="2" color="gray">{pkg.durationDays} ngày sử dụng VIP</Text>
                </Flex>
                <Badge color={pkg.enabled ? "green" : "gray"} variant="soft">
                  {pkg.enabled ? "Đang bật" : "Đang tắt"}
                </Badge>
              </Flex>

              <Flex direction="column" gap="2">
                <Text size="2" weight="medium">Tên gói</Text>
                <TextField.Root
                  value={pkg.name}
                  onChange={(event) => updatePackage(pkg.id, { name: event.target.value })}
                />
              </Flex>

              <Flex direction="column" gap="2">
                <Text size="2" weight="medium">Giá hiển thị</Text>
                <TextField.Root
                  value={pkg.price}
                  placeholder="VD: 49000"
                  onChange={(event) => updatePackage(pkg.id, { price: event.target.value })}
                />
              </Flex>

              <Flex justify="between" align="center">
                <Flex direction="column" gap="0">
                  <Text size="2" weight="medium">Bật gói</Text>
                  <Text size="1" color="gray">Cho phép hiển thị gói này ở phía người dùng</Text>
                </Flex>
                <Switch
                  checked={pkg.enabled}
                  onCheckedChange={(enabled) => updatePackage(pkg.id, { enabled })}
                />
              </Flex>
            </Flex>
          </Card>
        ))}
      </Box>
    </Flex>
  );
}
