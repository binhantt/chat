"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Text,
  Dialog,
} from "@radix-ui/themes";
import { EyeOpenIcon, BarChartIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

type AdItem = {
  id: string;
  userId: string;
  title: string;
  content: string | null;
  imageUrl: string | null;
  targetUrl: string | null;
  status: "pending" | "active" | "rejected" | "expired";
  totalImpressions: number;
  totalClicks: number;
  budget: number;
  user?: { id: string; fullName: string; email: string };
};

type AdStats = {
  totalAds: number;
  activeAds: number;
  totalImpressions: number;
  totalClicks: number;
};

export function AdsClientView() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<AdItem | null>(null);

  const fetchData = async () => {
    try {
      const [adsRes, statsRes] = await Promise.all([
        fetch("/api/v1/manager/ad"),
        fetch("/api/v1/manager/ad/stats"),
      ]);
      if (adsRes.ok) setAds(await adsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: string, status: "active" | "rejected") => {
    await fetch(`/api/v1/manager/ad/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSelectedAd(null);
    fetchData();
  };

  const s = useAdminStyles();
  if (loading) {
    return <Text className={s.ad.loadingText}>Đang tải...</Text>;
  }

  return (
    <Flex direction="column" gap="5">
      {/* Page Header */}
      <Box>
        <Heading size={{ initial: "5", md: "6" }} className={s.ad.pageHeading}>
          Quản lý quảng cáo
        </Heading>
        <Text as="p" size="2" className={s.ad.descriptionText}>
          Duyệt và quản lý quảng cáo từ người dùng.
        </Text>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Flex gap="4" wrap="wrap">
          <StatCard label="Tổng quảng cáo" value={stats.totalAds} color="var(--primary)" />
          <StatCard label="Đang chạy" value={stats.activeAds} color="var(--chat-success)" />
          <StatCard label="Lượt hiển thị" value={stats.totalImpressions} color="var(--chat-accent)" />
          <StatCard label="Lượt nhấp" value={stats.totalClicks} color="var(--chat-danger)" />
        </Flex>
      )}

      {/* Content Panel */}
      <Box className={s.ad.contentPanel}>
        <Table.Root>
          <Table.Header>
            <Table.Row className={s.ad.tableHeaderRow}>
              <Table.ColumnHeaderCell className={s.ad.tableHeaderCell}>Tiêu đề</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className={s.ad.tableHeaderCell}>Người dùng</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className={s.ad.tableHeaderCell}>Trạng thái</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className={s.ad.tableHeaderCell}>Hiển thị</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className={s.ad.tableHeaderCell}>Nhấp</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className={s.ad.tableHeaderCell}>Ngân sách</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className={s.ad.tableHeaderCell}>Hành động</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ads.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={7}>
                  <Text size="2" className={s.ad.emptyCell}>
                    Chưa có quảng cáo nào.
                  </Text>
                </Table.Cell>
              </Table.Row>
            )}
            {ads.map((ad) => (
              <Table.Row key={ad.id} className={s.ad.tableRow}>
                <Table.Cell>
                  <Text size="2" weight="medium" className={s.ad.primaryText}>
                    {ad.title}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" className={s.ad.secondaryText}>
                    {ad.user?.fullName || ad.user?.email || ad.userId}
                  </Text>
                </Table.Cell>
                <Table.Cell><StatusBadge status={ad.status} /></Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    <EyeOpenIcon width={14} height={14} className={s.ad.iconSecondary} />
                    <Text size="2" className={s.ad.primaryText}>{ad.totalImpressions}</Text>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    <BarChartIcon width={14} height={14} className={s.ad.iconSecondary} />
                    <Text size="2" className={s.ad.primaryText}>{ad.totalClicks}</Text>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" weight="medium" className={s.ad.primaryText}>
                    {Number(ad.budget).toLocaleString()}đ
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() => setSelectedAd(ad)}
                    className={s.ad.actionButton}
                  >
                    Duyệt
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Review Dialog */}
      <Dialog.Root open={!!selectedAd} onOpenChange={(open) => !open && setSelectedAd(null)}>
        {selectedAd && (
          <Dialog.Content className={s.ad.dialogContent}>
            <Dialog.Title className={s.ad.dialogTitle}>
              Duyệt quảng cáo
            </Dialog.Title>
            <Flex direction="column" gap="4">
              <Box className={s.ad.dialogDetailBox}>
                <Text size="4" weight="bold" className={s.ad.dialogAdTitle}>
                  {selectedAd.title}
                </Text>
                {selectedAd.content && (
                  <Text size="2" className={s.ad.dialogContentText}>{selectedAd.content}</Text>
                )}
                {selectedAd.imageUrl && (
                  <Box mt="3">
                    <img src={selectedAd.imageUrl} alt={selectedAd.title}
                      className={s.ad.dialogImage} />
                  </Box>
                )}
                {selectedAd.targetUrl && (
                  <Text size="2" className={s.ad.dialogTargetUrl}>
                    🔗 {selectedAd.targetUrl}
                  </Text>
                )}
              </Box>
              <Flex gap="3" mt="3">
                <Button
                  color="green"
                  onClick={() => updateStatus(selectedAd.id, "active")}
                  className={s.ad.approveButton}
                >
                  ✅ Duyệt
                </Button>
                <Button
                  color="red"
                  variant="soft"
                  onClick={() => updateStatus(selectedAd.id, "rejected")}
                  className={s.ad.rejectButton}
                >
                  ❌ Từ chối
                </Button>
              </Flex>
            </Flex>
          </Dialog.Content>
        )}
      </Dialog.Root>
    </Flex>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const s = useAdminStyles();
  return (
    <Flex
      direction="column"
      gap="1"
      className={s.ad.statCard}
    >
      <Text size="1" className={s.ad.statLabel}>{label}</Text>
      <Text size="6" weight="bold" style={{ color }}>{value.toLocaleString()}</Text>
    </Flex>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, "gray" | "green" | "red" | "amber"> = {
    pending: "amber",
    active: "green",
    rejected: "red",
    expired: "gray",
  };
  return (
    <Badge color={colorMap[status] ?? "gray"} variant="soft">
      {status === "pending" && "Chờ duyệt"}
      {status === "active" && "Đang chạy"}
      {status === "rejected" && "Từ chối"}
      {status === "expired" && "Hết hạn"}
    </Badge>
  );
}
