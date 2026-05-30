"use client";

import { useEffect, useState } from "react";
import { BarChartIcon, EyeOpenIcon, PersonIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Box, Button, Flex, Grid, Spinner, Text } from "@radix-ui/themes";
import { getAdminVisitStats, type AdminVisitStats } from "@/features/athu";
import { authTheme } from "@/features/athu/styles/authTheme";
import { adminPanelStyle } from "@/features/admin/styles/dashboardTheme";

export function AdminVisitStatsPanel() {
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
    <Box style={adminPanelStyle}>
      <Flex direction="column" gap="4">
        <Flex align="center" gap="3" justify="between" wrap="wrap">
          <Box>
            <Text as="div" size="4" weight="bold" style={{ color: authTheme.text }}>
              Thống kê người vào trang
            </Text>
            <Text as="div" size="2" style={{ color: authTheme.muted, marginTop: 4 }}>
              Theo dõi lượt xem, khách duy nhất và đường dẫn được xem nhiều.
            </Text>
          </Box>
          <Button disabled={loading} onClick={() => void refresh()} size="2" variant="soft" style={{ borderRadius: 8 }}>
            <ReloadIcon />
            Cập nhật
          </Button>
        </Flex>

        {loading && !stats ? (
          <Flex align="center" gap="2">
            <Spinner size="1" />
            <Text size="2" style={{ color: authTheme.muted }}>
              Đang tải thống kê truy cập...
            </Text>
          </Flex>
        ) : error ? (
          <Text size="2" color="red">
            {error}
          </Text>
        ) : stats ? (
          <>
            <Grid columns={{ initial: "2", md: "4" }} gap="3">
              <VisitMetric icon={<EyeOpenIcon />} label="Tổng lượt xem" value={stats.totalViews} />
              <VisitMetric icon={<PersonIcon />} label="Khách duy nhất" value={stats.uniqueVisitors} />
              <VisitMetric icon={<BarChartIcon />} label="Hôm nay" value={stats.todayViews} />
              <VisitMetric icon={<BarChartIcon />} label="7 ngày" value={stats.last7DaysViews} />
            </Grid>

            <Flex direction="column" gap="2">
              <Text size="2" weight="bold" style={{ color: authTheme.text }}>
                Trang được xem nhiều
              </Text>
              {stats.popularPaths.length === 0 ? (
                <Text size="2" style={{ color: authTheme.muted }}>
                  Chưa có dữ liệu truy cập.
                </Text>
              ) : (
                stats.popularPaths.map((item) => (
                  <Flex align="center" gap="3" justify="between" key={item.path}>
                    <Text size="2" style={{ color: authTheme.text, overflowWrap: "anywhere" }}>
                      {item.path}
                    </Text>
                    <Text size="2" weight="bold" style={{ color: authTheme.control }}>
                      {item.count}
                    </Text>
                  </Flex>
                ))
              )}
            </Flex>

            <Text size="1" style={{ color: authTheme.muted }}>
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
  return (
    <Box
      style={{
        background: "rgba(59,130,246,0.06)",
        border: `1px solid ${authTheme.line}`,
        borderRadius: 8,
        padding: 12,
      }}
    >
      <Flex align="center" gap="2">
        <Flex
          align="center"
          justify="center"
          style={{
            background: "rgba(59,130,246,0.12)",
            borderRadius: 8,
            color: authTheme.control,
            height: 34,
            width: 34,
          }}
        >
          {icon}
        </Flex>
        <Box>
          <Text as="div" size="1" style={{ color: authTheme.muted }}>
            {label}
          </Text>
          <Text as="div" size="5" weight="bold" style={{ color: authTheme.text }}>
            {value}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
