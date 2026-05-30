"use client";

import { Box, Button, Flex, Grid, Text } from "@radix-ui/themes";
import { ClockIcon, Component1Icon, ReloadIcon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";
import { useState } from "react";
import { authTheme } from "@/features/athu/styles/authTheme";
import { useAdminServerMetrics } from "../../hooks/useAdminServerMetrics";
import { adminPanelStyle } from "@/features/admin/styles/dashboardTheme";

export function AdminServerMetricsPanel() {
  const { error, loading, metrics, refresh } = useAdminServerMetrics();
  const [expanded, setExpanded] = useState(false);

  const openMetrics = async () => {
    setExpanded(true);
    if (!metrics) {
      await refresh();
    }
  };

  return (
    <Box style={adminPanelStyle}>
      <Flex direction="column" gap="4">
        <Flex align="start" justify="between" gap="3">
          <Box>
            <Text as="div" size="4" weight="bold" style={{ color: authTheme.text }}>
              Tài nguyên server
            </Text>
            <Text as="div" size="2" style={{ color: authTheme.muted, marginTop: 4 }}>
              CPU và RAM đang hoạt động trên server backend.
            </Text>
          </Box>
          {expanded ? (
            <Button disabled={loading} onClick={() => void refresh()} size="2" variant="soft" style={{ borderRadius: 8 }}>
              <ReloadIcon />
              Cập nhật
            </Button>
          ) : (
            <Button disabled={loading} onClick={() => void openMetrics()} size="2" style={{ borderRadius: 8 }}>
              Xem tài nguyên
            </Button>
          )}
        </Flex>

        {!expanded && (
          <Box style={{ background: "rgba(59,130,246,0.06)", borderRadius: 8, padding: 14 }}>
            <Text size="2" style={{ color: authTheme.muted }}>
              Bấm xem tài nguyên để lấy CPU và RAM hiện tại. Dữ liệu sẽ giữ nguyên đến khi bạn bấm cập nhật.
            </Text>
          </Box>
        )}

        {expanded && loading && !metrics && (
          <Box style={{ background: "rgba(59,130,246,0.06)", borderRadius: 8, padding: 14 }}>
            <Text size="2" style={{ color: authTheme.muted }}>
              Đang lấy thông số server...
            </Text>
          </Box>
        )}

        {error && (
          <Box style={{ background: "rgba(239,68,68,0.08)", borderRadius: 8, padding: 10 }}>
            <Text size="2" style={{ color: "#B91C1C" }}>
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
              <Text size="1" style={{ color: authTheme.muted }}>
                {metrics.system.hostname} - {metrics.system.platform}
              </Text>
              <Text size="1" style={{ color: authTheme.muted }}>
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
  const color = tone === "cyan" ? authTheme.cyan : authTheme.control;
  const width = Math.min(Math.max(value, 0), 100);

  return (
    <Box style={{ background: "rgba(59,130,246,0.06)", borderRadius: 8, padding: 14 }}>
      <Flex align="center" justify="between" mb="2">
        <Text size="2" weight="bold" style={{ color: authTheme.text }}>
          {label}
        </Text>
        <Text size="5" weight="bold" style={{ color }}>
          {width}%
        </Text>
      </Flex>
      <Box style={{ background: "rgba(15,23,42,0.08)", borderRadius: 999, height: 10, overflow: "hidden" }}>
        <Box style={{ background: color, borderRadius: 999, height: "100%", transition: "width 180ms ease", width: `${width}%` }} />
      </Box>
      <Text as="div" size="1" style={{ color: authTheme.muted, marginTop: 8 }}>
        {meta}
      </Text>
    </Box>
  );
}

function SmallMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Flex align="center" gap="3" style={{ background: authTheme.panel, borderRadius: 8, padding: 12 }}>
      <Flex
        align="center"
        justify="center"
        style={{ background: "rgba(59,130,246,0.1)", borderRadius: 8, color: authTheme.control, height: 34, width: 34 }}
      >
        {icon}
      </Flex>
      <Box>
        <Text as="div" size="1" style={{ color: authTheme.muted }}>
          {label}
        </Text>
        <Text as="div" size="2" weight="bold" style={{ color: authTheme.text }}>
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
