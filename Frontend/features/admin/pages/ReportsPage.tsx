"use client";

import {
  Flex,
  Text,
  Box,
  Card,
  Heading,
  Button,
  Callout,
  Spinner,
  Badge,
  Select,

} from "@radix-ui/themes";
import {
  DownloadIcon as DownloadIcon2,
  FileTextIcon as FileTextIcon2,
  ArrowUpIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { getAdminUsers } from "@/features/athu";
import { getConversations } from "@/features/athu";

interface ReportItem {
  id: string;
  title: string;
  description: string;
  type: "users" | "chats" | "activity" | "system";
  createdAt: string;
  size: string;
}

const mockReports: ReportItem[] = [
  {
    id: "rpt-001",
    title: "Báo cáo người dùng - Tháng 4/2026",
    description: "Thống kê người dùng đăng ký, hoạt động và bị khóa trong tháng 4",
    type: "users",
    createdAt: "2026-05-01T00:00:00Z",
    size: "1.2 MB",
  },
  {
    id: "rpt-002",
    title: "Báo cáo tin nhắn - Tuần 18",
    description: "Số lượng cuộc trò chuyện, tin nhắn gửi/nhận theo ngày",
    type: "chats",
    createdAt: "2026-05-05T00:00:00Z",
    size: "856 KB",
  },
  {
    id: "rpt-003",
    title: "Báo cáo hoạt động - Tháng 4/2026",
    description: "Phân tích hành vi người dùng, thời gian sử dụng, tính năng phổ biến",
    type: "activity",
    createdAt: "2026-05-01T00:00:00Z",
    size: "2.4 MB",
  },
  {
    id: "rpt-004",
    title: "Báo cáo hệ thống - Tháng 4/2026",
    description: "Tình trạng server, lỗi, cảnh báo và downtime",
    type: "system",
    createdAt: "2026-05-01T00:00:00Z",
    size: "512 KB",
  },
];

function TypeBadge({ type }: { type: ReportItem["type"] }) {
  const config = {
    users: { label: "Người dùng", color: "indigo" },
    chats: { label: "Tin nhắn", color: "green" },
    activity: { label: "Hoạt động", color: "amber" },
    system: { label: "Hệ thống", color: "gray" },
  };
  const { label, color } = config[type];
  return (
    <Badge color={color as any} variant="soft">
      {label}
    </Badge>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function BarChartSimple({ data, height = 160 }: { data: { label: string; value: number; color: string }[]; height?: number }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return (
    <Box style={{ padding: "16px 0" }}>
      <Flex align="end" gap="3" style={{ height }}>
        {data.map((item) => {
          const barHeight = (item.value / maxValue) * height;
          return (
            <Flex key={item.label} direction="column" align="center" gap="2" style={{ flex: 1 }}>
              <Text size="2" weight="medium">{item.value}</Text>
              <Box
                style={{
                  width: "100%",
                  maxWidth: 48,
                  height: barHeight,
                  background: item.color,
                  borderRadius: "6px 6px 0 0",
                  transition: "height 0.3s ease",
                }}
              />
              <Text size="1" color="gray">{item.label}</Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
}

export function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [reportPeriod, setReportPeriod] = useState<string>("monthly");

  useEffect(() => {
    Promise.all([getAdminUsers(), getConversations()])
      .then(([users, chats]) => {
        setUserCount(Array.isArray(users) ? users.length : 0);
        setChatCount(Array.isArray(chats) ? chats.length : 0);
      })
      .catch(() => {
        setUserCount(mockReports.length * 3);
        setChatCount(mockReports.length * 5);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredReports = mockReports.filter((r) => typeFilter === "all" || r.type === typeFilter);

  const chartData = [
    { label: "T2", value: Math.floor(userCount * 0.7), color: "var(--indigo-7)" },
    { label: "T3", value: Math.floor(userCount * 0.85), color: "var(--indigo-7)" },
    { label: "T4", value: Math.floor(userCount * 0.6), color: "var(--indigo-7)" },
    { label: "T5", value: Math.floor(userCount * 1.1), color: "var(--indigo-7)" },
    { label: "T6", value: Math.floor(userCount * 0.95), color: "var(--indigo-7)" },
    { label: "T7", value: Math.floor(userCount * 1.3), color: "var(--indigo-7)" },
    { label: "CN", value: Math.floor(userCount * 0.8), color: "var(--indigo-7)" },
  ];

  const chatChartData = [
    { label: "T2", value: Math.floor(chatCount * 0.9), color: "var(--green-7)" },
    { label: "T3", value: Math.floor(chatCount * 1.2), color: "var(--green-7)" },
    { label: "T4", value: Math.floor(chatCount * 0.75), color: "var(--green-7)" },
    { label: "T5", value: Math.floor(chatCount * 1.4), color: "var(--green-7)" },
    { label: "T6", value: Math.floor(chatCount * 1.1), color: "var(--green-7)" },
    { label: "T7", value: Math.floor(chatCount * 1.6), color: "var(--green-7)" },
    { label: "CN", value: Math.floor(chatCount * 0.95), color: "var(--green-7)" },
  ];

  return (
    <Flex direction="column" gap="5">
      <Flex justify="between" align="center">
        <Heading size="6">Báo cáo</Heading>
        <Flex align="center" gap="2">
          <Select.Root value={reportPeriod} onValueChange={setReportPeriod}>
            <Select.Trigger style={{ maxWidth: 140 }}>
              {reportPeriod === "weekly" ? "Tuần này" : reportPeriod === "monthly" ? "Tháng này" : "Quý này"}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="weekly">Tuần này</Select.Item>
              <Select.Item value="monthly">Tháng này</Select.Item>
              <Select.Item value="quarterly">Quý này</Select.Item>
            </Select.Content>
          </Select.Root>
          <Button variant="solid" size="1">
            <DownloadIcon2 width={14} height={14} />
            Xuất báo cáo
          </Button>
        </Flex>
      </Flex>

      {/* Stats */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        <Card size="1" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">Người dùng</Text>
            <Heading size="5">{loading ? "..." : userCount}</Heading>
            <Flex align="center" gap="1">
              <ArrowUpIcon width={12} height={12} color="var(--green-9)" />
              <Text size="1" color="green">+12% so với tháng trước</Text>
            </Flex>
          </Flex>
        </Card>
        <Card size="1" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">Cuộc trò chuyện</Text>
            <Heading size="5" color="green">{loading ? "..." : chatCount}</Heading>
            <Flex align="center" gap="1">
              <ArrowUpIcon width={12} height={12} color="var(--green-9)" />
              <Text size="1" color="green">+8% so với tháng trước</Text>
            </Flex>
          </Flex>
        </Card>
        <Card size="1" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">Tin nhắn gửi</Text>
            <Heading size="5" color="indigo">{loading ? "..." : userCount * 12}</Heading>
            <Flex align="center" gap="1">
              <ArrowUpIcon width={12} height={12} color="var(--green-9)" />
              <Text size="1" color="green">+23% so với tháng trước</Text>
            </Flex>
          </Flex>
        </Card>
        <Card size="1" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">Báo cáo đã tạo</Text>
            <Heading size="5" color="amber">{mockReports.length}</Heading>
            <Text size="1" color="gray">Tháng này</Text>
          </Flex>
        </Card>
      </Box>

      {/* Charts Row */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        <Card size="2">
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="4">Người dùng mới theo ngày</Heading>
              <Badge color="indigo" variant="soft">Tuần này</Badge>
            </Flex>
            {loading ? (
              <Flex justify="center" align="center" style={{ height: 160 }}>
                <Spinner size="3" />
              </Flex>
            ) : (
              <BarChartSimple data={chartData} />
            )}
          </Flex>
        </Card>

        <Card size="2">
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="4">Cuộc trò chuyện theo ngày</Heading>
              <Badge color="green" variant="soft">Tuần này</Badge>
            </Flex>
            {loading ? (
              <Flex justify="center" align="center" style={{ height: 160 }}>
                <Spinner size="3" />
              </Flex>
            ) : (
              <BarChartSimple data={chatChartData} />
            )}
          </Flex>
        </Card>
      </Box>

      {/* Reports List */}
      <Card size="2">
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center">
            <Heading size="4">Danh sách báo cáo</Heading>
            <Flex gap="2">
              <Button
                variant={typeFilter === "all" ? "solid" : "soft"}
                size="1"
                onClick={() => setTypeFilter("all")}
              >
                Tất cả
              </Button>
              <Button
                variant={typeFilter === "users" ? "solid" : "soft"}
                color="indigo"
                size="1"
                onClick={() => setTypeFilter("users")}
              >
                Người dùng
              </Button>
              <Button
                variant={typeFilter === "chats" ? "solid" : "soft"}
                color="green"
                size="1"
                onClick={() => setTypeFilter("chats")}
              >
                Tin nhắn
              </Button>
              <Button
                variant={typeFilter === "system" ? "solid" : "soft"}
                color="gray"
                size="1"
                onClick={() => setTypeFilter("system")}
              >
                Hệ thống
              </Button>
            </Flex>
          </Flex>

          <Flex direction="column" gap="2">
            {filteredReports.map((report) => (
              <Box
                key={report.id}
                style={{
                  border: "1px solid var(--gray-4)",
                  borderRadius: 8,
                  padding: 16,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--gray-1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Flex justify="between" align="start">
                  <Flex gap="3" align="start" style={{ flex: 1 }}>
                    <Box style={{ color: "var(--gray-9)", marginTop: 2 }}>
                      <FileTextIcon2 width={20} height={20} />
                    </Box>
                    <Flex direction="column" gap="1" style={{ flex: 1 }}>
                      <Flex align="center" gap="2">
                        <Text size="3" weight="medium">{report.title}</Text>
                        <TypeBadge type={report.type} />
                      </Flex>
                      <Text size="2" color="gray">{report.description}</Text>
                      <Flex gap="3" mt="1">
                        <Text size="1" color="gray">Ngày tạo: {formatDate(report.createdAt)}</Text>
                        <Text size="1" color="gray">Kích thước: {report.size}</Text>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex gap="1">
                    <Button variant="ghost" size="1">
                      <EyeOpenIcon width={14} height={14} />
                    </Button>
                    <Button variant="ghost" size="1">
                      <DownloadIcon2 width={14} height={14} />
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </Flex>

          {filteredReports.length === 0 && (
            <Flex justify="center" align="center" p="8" direction="column" gap="2">
              <FileTextIcon2 width={48} height={48} color="var(--gray-6)" />
              <Text size="3" color="gray">Không có báo cáo nào</Text>
            </Flex>
          )}
        </Flex>
      </Card>
    </Flex>
  );
}
