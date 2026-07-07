"use client";

import { useEffect, useState } from "react";
import { BarChartIcon, PersonIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Box, Button, Flex, Grid, Spinner, Text } from "@radix-ui/themes";
import { getAdminVisitStats, type AdminVisitStats } from "@/features/athu";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminVisitStatsPanel() {
  const s = useAdminStyles();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminVisitStats | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      setStats(await getAdminVisitStats());
    } catch (err) {
      console.error("Failed to load visit stats:", err);
      setError("Không thể tải thống kê truy cập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <Box className={s.dashboard.visitPanel}>
      <Flex direction="column" gap="4">
        <Flex align="center" gap="3" justify="between" wrap="wrap">
          <Box>
            <Text as="div" size="4" weight="bold" className={s.dashboard.visitTitle}>
              Thống kê người vào trang
            </Text>
            <Text as="div" size="2" className={s.dashboard.visitDesc}>
              Theo dõi lượt xem, khách duy nhất và đường dẫn được xem nhiều.
            </Text>
          </Box>
          <Button disabled={loading} onClick={() => void refresh()} size="2" variant="soft" className={s.dashboard.refreshBtn}>
            <ReloadIcon />
            Cập nhật
          </Button>
        </Flex>

        {loading && !stats ? (
          <Flex align="center" gap="2">
            <Spinner size="1" />
            <Text size="2" className={s.dashboard.metricsLoadingText}>
              Đang tải thống kê truy cập...
            </Text>
          </Flex>
        ) : error ? (
          <Text size="2" color="red">
            {error}
          </Text>
        ) : stats ? (
          <>
            <Grid columns={{ initial: "2", md: "3" }} gap="3">
              <VisitMetric icon={<PersonIcon />} label="Khách duy nhất" value={stats.uniqueVisitors} />
              <VisitMetric icon={<BarChartIcon />} label="Hôm nay" value={stats.todayViews} />
              <VisitMetric icon={<BarChartIcon />} label="7 ngày" value={stats.last7DaysViews} />
            </Grid>

            <Flex direction="column" gap="2">
              <Text size="2" weight="bold" className={s.dashboard.visitTitle}>
                Trang được xem nhiều
              </Text>
              {stats.popularPaths.length === 0 ? (
                <Text size="2" className={s.dashboard.visitMetricLabel}>
                  Chưa có dữ liệu truy cập.
                </Text>
              ) : (
                stats.popularPaths.map((item) => (
                  <Flex align="center" gap="3" justify="between" key={item.path}>
                    <Text size="2" className={s.dashboard.visitPathName}>
                      {item.path}
                    </Text>
                    <Text size="2" weight="bold" className={s.dashboard.visitPathCount}>
                      {item.count}
                    </Text>
                  </Flex>
                ))
              )}
            </Flex>

            <Text size="1" className={s.dashboard.visitFooter}>
              Cập nhật: {new Date(stats.sampledAt).toLocaleTimeString("vi-VN")}
            </Text>
          </>
        ) : null}
      </Flex>
    </Box>
  );
}

function VisitMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const s = useAdminStyles();
  return (
    <Box className={s.dashboard.visitMetricBox}>
      <Flex align="center" gap="2">
        <Flex align="center" justify="center" className={s.dashboard.visitMetricIconBox}>
          {icon}
        </Flex>
        <Box>
          <Text as="div" size="1" className={s.dashboard.visitMetricLabel}>
            {label}
          </Text>
          <Text as="div" size="5" weight="bold" className={s.dashboard.visitMetricValue}>
            {value}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
