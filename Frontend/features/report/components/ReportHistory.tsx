"use client";

import { Flex, Text, Card, Box, Badge } from "@radix-ui/themes";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reporter: {
    id: string;
    fullName: string | null;
    email: string;
  };
  reportedUser: {
    id: string;
    fullName: string | null;
    email: string;
  };
}

const catLabel: Record<string, string> = {
  spam: "🚫 Spam",
  harassment: "🚨 Harassment",
  inappropriate_content: "⚠️ Inappropriate",
  fake_profile: "🎭 Fake Profile",
  underage: "👶 Underage",
  other: "📋 Other",
};

const statusColor: Record<string, string> = {
  pending: "yellow",
  reviewed: "violet",
  resolved: "green",
  rejected: "red",
};

export function ReportHistory() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      const response = await fetch('/api/reports/my-reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch user reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  if (loading) {
    return (
      <Card
        size="2"
        style={{
          background: isDark ? "var(--gray-11)" : "var(--white)",
          padding: "24px",
        }}
      >
        <Flex direction="column" gap="4">
          <Text size="4" weight="bold">Lịch sử báo cáo</Text>
          <Text size="2" color="gray">Đang tải...</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card
      size="2"
      style={{
        background: isDark ? "var(--gray-11)" : "var(--white)",
        padding: "24px",
      }}
    >
      <Flex direction="column" gap="4">
        <Text size="4" weight="bold">Lịch sử báo cáo</Text>
        
        {reports.length === 0 ? (
          <Text size="2" color="gray">Chưa có báo cáo nào</Text>
        ) : (
          reports.map((report) => (
            <Flex
              key={report.id}
              direction="column"
              gap="2"
              style={{
                paddingBottom: "12px",
                borderBottom: "1px solid " + (isDark ? "var(--gray-6)" : "var(--gray-3)"),
              }}
            >
              <Flex justify="between" align="start">
                <Flex direction="column" gap="1">
                  <Text size="2" weight="medium">{catLabel[report.reason] || report.reason}</Text>
                  <Text size="1" color="gray">
                    Báo cáo bởi {report.reporter.fullName || report.reporter.email}
                  </Text>
                </Flex>
                <Flex align="center" gap="2">
                  <Badge color={statusColor[report.status] as any}>
                    {report.status === 'pending' ? 'Chờ xử lý' :
                     report.status === 'reviewed' ? 'Đã xem xét' :
                     report.status === 'resolved' ? 'Đã giải quyết' : 'Từ chối'}
                  </Badge>
                  <Text size="1" color="gray">{formatDate(report.createdAt)}</Text>
                </Flex>
              </Flex>
              
              {report.description && (
                <Text size="1" color="gray" style={{ maxWidth: "100%" }}>
                  {report.description.length > 100 
                    ? report.description.substring(0, 100) + "..." 
                    : report.description}
                </Text>
              )}
            </Flex>
          ))
        )}
      </Flex>
    </Card>
  );
}
