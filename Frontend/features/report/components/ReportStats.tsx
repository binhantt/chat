"use client";

import { Flex, Text, Card, Badge } from "@radix-ui/themes";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

interface ReportStatsData {
  totalReports: number;
  pendingReports: number;
  reviewedReports: number;
  resolvedReports: number;
  rejectedReports?: number;
  reportsByCategory?: Record<string, number>;
  reportsByUser?: Array<{
    userId: string;
    fullName: string;
    reportCount: number;
  }>;
}

interface ReportStatsProps {
  detailed?: boolean;
}

export function ReportStats({ detailed = false }: ReportStatsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardBackground = isDark ? "#111827" : "var(--white)";
  const panelBackground = isDark ? "#0f172a" : "var(--gray-1)";
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
      const response = await fetch('/api/v1/admin/reports/stats');
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
              background: cardBackground,
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
    <Flex direction="column" gap="4">
      <Flex gap="4" wrap="wrap">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            size="2"
            style={{
              flex: "1 1 180px",
              background: cardBackground,
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

      {detailed && (
        <Card
          size="2"
          style={{
            background: panelBackground,
            padding: "20px",
            marginTop: "16px",
          }}
        >
          <Flex direction="column" gap="3">
            <Text size="3" weight="bold">Thống kê chi tiết</Text>
            <Flex gap="2" wrap="wrap">
              <Badge color="indigo" variant="soft">
                Tổng: {stats.totalReports}
              </Badge>
              <Badge color="yellow" variant="soft">
                Chờ xử lý: {stats.pendingReports}
              </Badge>
              <Badge color="violet" variant="soft">
                Đã xem xét: {stats.reviewedReports}
              </Badge>
              <Badge color="green" variant="soft">
                Đã giải quyết: {stats.resolvedReports}
              </Badge>
              <Badge color="red" variant="soft">
                Từ chối: {stats.rejectedReports || 0}
              </Badge>
            </Flex>

            {stats.reportsByCategory && Object.keys(stats.reportsByCategory).length > 0 && (
              <Flex direction="column" gap="2" style={{ marginTop: "12px" }}>
                <Text size="2" weight="medium">Theo danh mục:</Text>
                <Flex gap="2" wrap="wrap">
                  {Object.entries(stats.reportsByCategory).map(([category, count]) => (
                    <Badge key={category} color="cyan" variant="soft">
                      {category}: {count}
                    </Badge>
                  ))}
                </Flex>
              </Flex>
            )}

            {stats.reportsByUser && stats.reportsByUser.length > 0 && (
              <Flex direction="column" gap="2" style={{ marginTop: "12px" }}>
                <Text size="2" weight="medium">Theo người dùng:</Text>
                <Flex gap="2" wrap="wrap">
                  {stats.reportsByUser.slice(0, 5).map((user) => (
                    <Badge key={user.userId} color="orange" variant="soft">
                      {user.fullName}: {user.reportCount}
                    </Badge>
                  ))}
                </Flex>
              </Flex>
            )}
          </Flex>
        </Card>
      )}
    </Flex>
  );
}
