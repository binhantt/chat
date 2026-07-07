"use client";

import { Box, Button, Flex, Grid, Text } from "@radix-ui/themes";
import { ClockIcon, Component1Icon, ReloadIcon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";
import { useState } from "react";
import { useAdminServerMetrics } from "../../hooks/useAdminServerMetrics";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminServerMetricsPanel() {
  const s = useAdminStyles();
  const { error, loading, metrics, refresh } = useAdminServerMetrics();
  const [expanded, setExpanded] = useState(false);

  const openMetrics = async () => {
    setExpanded(true);
    if (!metrics) {
      await refresh();
    }
  };

  return (
    <Box className={s.dashboard.metricsSection}>
      <Flex direction="column" gap="4">
        <Flex align="start" justify="between" gap="3">
          <Box>
            <Text as="div" size="4" weight="bold" className={s.dashboard.metricsTitle}>
              Tài nguyên server
            </Text>
            <Text as="div" size="2" className={s.dashboard.metricsDesc}>
              CPU và RAM đang hoạt động trên server backend.
            </Text>
          </Box>
          {expanded ? (
            <Button disabled={loading} onClick={() => void refresh()} size="2" variant="soft" className={s.dashboard.refreshBtn}>
              <ReloadIcon />
              Cập nhật
            </Button>
          ) : (
            <Button disabled={loading} onClick={() => void openMetrics()} size="2" className={s.dashboard.refreshBtn}>
              Xem tài nguyên
            </Button>
          )}
        </Flex>

        {!expanded && (
          <Box className={s.dashboard.metricsHint}>
            <Text size="2" className={s.dashboard.metricsHintText}>
              Bấm xem tài nguyên để lấy CPU và RAM hiện tại. Dữ liệu sẽ giữ nguyên đến khi bạn bấm cập nhật.
            </Text>
          </Box>
        )}

        {expanded && loading && !metrics && (
          <Box className={s.dashboard.metricsLoading}>
            <Text size="2" className={s.dashboard.metricsLoadingText}>
              Đang lấy thông số server...
            </Text>
          </Box>
        )}

        {error && (
          <Box className={s.dashboard.metricsError}>
            <Text size="2" className={s.dashboard.metricsErrorText}>
              {error}
            </Text>
          </Box>
        )}

        {expanded && metrics && (
          <>
            <Grid columns={{ initial: "1", md: "2" }} gap="3">
              <MetricMeter label="CPU" meta={`${metrics.cpu.cores} nhân`} value={metrics.cpu.usagePercent} />
              <MetricMeter
                label="RAM"
                meta={`${formatBytes(metrics.memory.usedBytes)} / ${formatBytes(metrics.memory.totalBytes)}`}
                tone="cyan"
                value={metrics.memory.usedPercent}
              />
            </Grid>

            <Grid columns={{ initial: "1", md: "3" }} gap="3">
              <SmallMetric icon={<Component1Icon />} label="Bộ nhớ Node" value={formatBytes(metrics.process.rssBytes)} />
              <SmallMetric
                icon={<Component1Icon />}
                label="Bộ nhớ heap"
                value={`${formatBytes(metrics.process.heapUsedBytes)} / ${formatBytes(metrics.process.heapTotalBytes)}`}
              />
              <SmallMetric icon={<ClockIcon />} label="Thời gian chạy" value={formatDuration(metrics.system.uptimeSeconds)} />
            </Grid>

            <Flex align="center" justify="between" gap="3" wrap="wrap">
              <Text size="1" className={s.dashboard.metricsFooter}>
                {metrics.system.hostname} - {metrics.system.platform}
              </Text>
              <Text size="1" className={s.dashboard.metricsFooter}>
                Cập nhật: {new Date(metrics.sampledAt).toLocaleTimeString("vi-VN")}
              </Text>
            </Flex>
          </>
        )}
      </Flex>
    </Box>
  );
}

function MetricMeter({
  label,
  meta,
  tone = "blue",
  value,
}: {
  label: string;
  meta: string;
  tone?: "blue" | "cyan";
  value: number;
}) {
  const s = useAdminStyles();
  const color = tone === "cyan" ? "#22d3ee" : "var(--primary)";
  const width = Math.min(Math.max(value, 0), 100);

  return (
    <Box className={s.dashboard.meterBox}>
      <Flex align="center" justify="between" mb="2">
        <Text size="2" weight="bold" className={s.dashboard.meterLabel}>
          {label}
        </Text>
        <Text size="5" weight="bold" style={{ color }}>
          {width}%
        </Text>
      </Flex>
      <Box className={s.dashboard.meterBar}>
        <Box className={s.dashboard.meterBarFill} style={{ background: color, width: `${width}%` }} />
      </Box>
      <Text as="div" size="1" className={s.dashboard.meterMeta}>
        {meta}
      </Text>
    </Box>
  );
}

function SmallMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  const s = useAdminStyles();
  return (
    <Flex align="center" gap="3" className={s.dashboard.smallMetric}>
      <Flex align="center" justify="center" className={s.dashboard.smallMetricIcon}>
        {icon}
      </Flex>
      <Box>
        <Text as="div" size="1" className={s.dashboard.smallMetricLabel}>
          {label}
        </Text>
        <Text as="div" size="2" weight="bold" className={s.dashboard.smallMetricValue}>
          {value}
        </Text>
      </Box>
    </Flex>
  );
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

function formatDuration(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days} ngày ${hours} giờ`;
  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  return `${minutes} phút`;
}
