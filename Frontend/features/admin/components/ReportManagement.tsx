"use client";

import { Flex, Text, Card, Button, Badge, Dialog, Dialog.Content, Dialog.Header, Dialog.Title, DialogTrigger } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

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

export function ReportManagement() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [updateStatus, setUpdateStatus] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchReports();
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Failed to update report status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <Card size="2" style={{
        background: isDark ? "var(--gray-11)" : "var(--white)",
        padding: "24px",
      }}>
        <Text size="4" weight="bold">Quản lý báo cáo</Text>
        <Text size="2" color="gray">Đang tải...</Text>
      </Card>
    );
  }

  return (
    <Card size="2" style={{
      background: isDark ? "var(--gray-11)" : "var(--white)",
      padding: "24px",
    }}>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Text size="4" weight="bold">Quản lý báo cáo</Text>
          <Button 
            size="2" 
            color="indigo"
            onClick={fetchReports}
          >
            🔄 Làm mới
          </Button>
        </Flex>

        <Flex gap="2" wrap="wrap">
          <Badge color="yellow" variant="outline">
            Chờ xử lý: {reports.filter(r => r.status === 'pending').length}
          </Badge>
          <Badge color="violet" variant="outline">
            Đã xem xét: {reports.filter(r => r.status === 'reviewed').length}
          </Badge>
          <Badge color="green" variant="outline">
            Đã giải quyết: {reports.filter(r => r.status === 'resolved').length}
          </Badge>
          <Badge color="red" variant="outline">
            Từ chối: {reports.filter(r => r.status === 'rejected').length}
          </Badge>
        </Flex>

        {reports.length === 0 ? (
          <Text size="2" color="gray">Không có báo cáo nào</Text>
        ) : (
          <Flex direction="column" gap="3">
            {reports.map((report) => (
              <Card 
                key={report.id} 
                size="1"
                style={{
                  background: isDark ? "var(--gray-10)" : "var(--gray-1)",
                  padding: "16px",
                }}
              >
                <Flex justify="between" align="start" gap="4">
                  <Flex direction="column" gap="2" flex="1">
                    <Flex align="center" gap="2">
                      <Text size="3" weight="bold">{catLabel[report.reason] || report.reason}</Text>
                      <Badge color={statusColor[report.status] as any}>
                        {report.status === 'pending' ? 'Chờ xử lý' :
                         report.status === 'reviewed' ? 'Đã xem xét' :
                         report.status === 'resolved' ? 'Đã giải quyết' : 'Từ chối'}
                      </Badge>
                    </Flex>
                    
                    <Text size="2" color="gray">
                      <strong>Người báo cáo:</strong> {report.reporter.fullName || report.reporter.email}
                    </Text>
                    
                    <Text size="2" color="gray">
                      <strong>Người bị báo cáo:</strong> {report.reportedUser.fullName || report.reportedUser.email}
                    </Text>
                    
                    {report.description && (
                      <Text size="2" color="gray" style={{ maxWidth: "100%" }}>
                        <strong>Nội dung:</strong> {report.description}
                      </Text>
                    )}
                    
                    <Text size="1" color="gray">
                      {formatDate(report.createdAt)}
                    </Text>
                  </Flex>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="2" variant="outline" onClick={() => setSelectedReport(report)}>
                        Xử lý
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Xử lý báo cáo</DialogTitle>
                      </DialogHeader>
                      <Flex direction="column" gap="4">
                        <Flex direction="column" gap="2">
                          <Text size="2" weight="bold">{catLabel[report.reason] || report.reason}</Text>
                          <Text size="2" color="gray">
                            Người báo cáo: {report.reporter.fullName || report.reporter.email}
                          </Text>
                          <Text size="2" color="gray">
                            Người bị báo cáo: {report.reportedUser.fullName || report.reportedUser.email}
                          </Text>
                          {report.description && (
                            <Text size="2" color="gray">
                              Nội dung: {report.description}
                            </Text>
                          )}
                        </Flex>
                        
                        <Flex direction="column" gap="2">
                          <Text size="2" weight="bold">Cập nhật trạng thái:</Text>
                          <Flex gap="2" wrap="wrap">
                            <Button 
                              size="2" 
                              color="yellow"
                              variant={updateStatus === 'pending' ? 'solid' : 'outline'}
                              onClick={() => setUpdateStatus('pending')}
                            >
                              Chờ xử lý
                            </Button>
                            <Button 
                              size="2" 
                              color="violet"
                              variant={updateStatus === 'reviewed' ? 'solid' : 'outline'}
                              onClick={() => setUpdateStatus('reviewed')}
                            >
                              Đã xem xét
                            </Button>
                            <Button 
                              size="2" 
                              color="green"
                              variant={updateStatus === 'resolved' ? 'solid' : 'outline'}
                              onClick={() => setUpdateStatus('resolved')}
                            >
                              Đã giải quyết
                            </Button>
                            <Button 
                              size="2" 
                              color="red"
                              variant={updateStatus === 'rejected' ? 'solid' : 'outline'}
                              onClick={() => setUpdateStatus('rejected')}
                            >
                              Từ chối
                            </Button>
                          </Flex>
                        </Flex>
                        
                        <Flex gap="2" justify="end">
                          <Button 
                            size="2" 
                            variant="outline"
                            onClick={() => {
                              setSelectedReport(null);
                              setUpdateStatus("");
                            }}
                          >
                            Hủy
                          </Button>
                          <Button 
                            size="2" 
                            color="indigo"
                            disabled={!updateStatus}
                            onClick={() => {
                              if (selectedReport) {
                                updateReportStatus(selectedReport.id, updateStatus);
                              }
                            }}
                          >
                            Cập nhật
                          </Button>
                        </Flex>
                      </Flex>
                    </DialogContent>
                  </Dialog>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}