"use client";

import { Flex, Text, Card } from "@radix-ui/themes";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

interface ReportStatsData {
  totalReports: number;
  pendingReports: number;
  reviewedReports: number;
  resolvedReports: number;
}

export function ReportStats() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [stats, setStats] = useState<ReportStatsData>({
    totalReports: 0,
    pendingReports: 0,
    reviewedReports: 0,
    resolvedReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportStats();
  }, []);

  const fetchReportStats = async () => {
    try {
      const response = await fetch('/api/reports/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch report stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: "Tổng báo cáo", 
      value: stats.totalReports.toString(), 
      icon: "📊", 
      color: "indigo" 
    },
    { 
      label: "Chờ xử lý", 
      value: stats.pendingReports.toString(), 
      icon: "⏳", 
      color: "amber" 
    },
    { 
      label: "Đã xem xét", 
      value: stats.reviewedReports.toString(), 
      icon: "👀", 
      color: "violet" 
    },
    { 
      label: "Đã giải quyết", 
      value: stats.resolvedReports.toString(), 
      icon: "✅", 
      color: "teal" 
    },
  ];

  if (loading) {
    return (
      <Flex gap="4" wrap="wrap">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            size="2"
            style={{
              flex: "1 1 180px",
              background: isDark ? "var(--gray-11)" : "var(--white)",
              padding: "20px",
            }}
          >
            <Flex direction="column" gap="2" align="center">
              <Text size="6">⏳</Text>
              <Text size="8" weight="bold" color="gray">...</Text>
              <Text size="2" color="gray">Đang tải...</Text>
            </Flex>
          </Card>
        ))}
      </Flex>
    );
  }

  return (
    <Flex gap="4" wrap="wrap">
      {statCards.map((stat) => (
        <Card
          key={stat.label}
          size="2"
          style={{
            flex: "1 1 180px",
            background: isDark ? "var(--gray-11)" : "var(--white)",
            padding: "20px",
          }}
        >
          <Flex direction="column" gap="2" align="center">
            <Text size="6">{stat.icon}</Text>
            <Text size="8" weight="bold" color={stat.color as any}>{stat.value}</Text>
            <Text size="2" color="gray">{stat.label}</Text>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}
