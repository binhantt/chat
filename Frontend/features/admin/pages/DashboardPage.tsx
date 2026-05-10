"use client";

import { Flex, Text, Box, Card, Heading, Avatar, Badge, Spinner, Callout } from "@radix-ui/themes";
import {
  PersonIcon,
  ChatBubbleIcon,
  FileTextIcon,
  DiscIcon,
  PlusIcon,
  DownloadIcon,
  GearIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ReloadIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import { useState, useEffect, useCallback } from "react";
import { getAdminUsers, type AdminUser } from "@/features/athu";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down";
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, changeType, icon, color }: StatCardProps) {
  return (
    <Card size="2" style={{ flex: 1 }}>
      <Flex gap="4" align="center">
        <Box
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: `var(--${color}-3)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box style={{ color: `var(--${color}-9)` }}>{icon}</Box>
        </Box>
        <Flex direction="column" gap="1">
          <Text size="2" color="gray">{title}</Text>
          <Heading size="7">{value}</Heading>
          {change && changeType && (
            <Flex align="center" gap="1">
              {changeType === "up" ? (
                <ArrowUpIcon width={14} height={14} color="var(--green-9)" />
              ) : (
                <ArrowDownIcon width={14} height={14} color="var(--red-9)" />
              )}
              <Text size="2" color={changeType === "up" ? "green" : "red"}>
                {change}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

function WeeklyChart({ data }: { data: ChartData[] }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const chartHeight = 160;

  if (data.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ height: chartHeight }}>
        <Text color="gray">Không có dữ liệu</Text>
      </Flex>
    );
  }

  return (
    <Box style={{ padding: "16px 0" }}>
      <Flex align="end" gap="3" style={{ height: chartHeight }}>
        {data.map((item) => {
          const height = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
          return (
            <Flex key={item.label} direction="column" align="center" gap="2" style={{ flex: 1 }}>
              <Box
                style={{
                  width: "100%",
                  maxWidth: 40,
                  height: height,
                  background: item.color,
                  borderRadius: "6px 6px 0 0",
                  transition: "height 0.3s ease",
                  position: "relative",
                }}
                title={`${item.value} người dùng`}
              >
                <Text
                  size="1"
                  style={{
                    position: "absolute",
                    top: -20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "var(--gray-10)",
                  }}
                >
                  {item.value}
                </Text>
              </Box>
              <Text size="1" color="gray">
                {item.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  const paths = data.map((item) => {
    const angle = total > 0 ? (item.value / total) * 360 : 0;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...item, startAngle, angle };
  });

  const radius = 50;
  const cx = 60;
  const cy = 60;

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return [
      "M", cx, cy,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  if (total === 0) {
    return (
      <Flex justify="center" align="center" style={{ height: 120 }}>
        <Text color="gray">Không có dữ liệu</Text>
      </Flex>
    );
  }

  return (
    <Flex gap="4" align="center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {paths.map((path, i) => (
          <path
            key={i}
            d={describeArc(path.startAngle, path.startAngle + Math.max(path.angle - 1, 0))}
            fill={path.color}
            stroke="var(--gray-1)"
            strokeWidth="2"
          />
        ))}
        <circle cx={cx} cy={cy} r={30} fill="var(--gray-1)" />
      </svg>
      <Flex direction="column" gap="2">
        {data.map((item) => (
          <Flex key={item.label} align="center" gap="2">
            <Box
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: item.color,
              }}
            />
            <Text size="2">{item.label}</Text>
            <Text size="2" weight="medium" style={{ marginLeft: "auto", minWidth: 35 }}>
              {item.value}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}

function StatusBadge({ status }: { status: "online" | "offline" | "banned" }) {
  const config = {
    online: { label: "Online", color: "green" },
    offline: { label: "Offline", color: "gray" },
    banned: { label: "Banned", color: "red" },
  };
  const { label, color } = config[status];
  return (
    <Badge color={color as any} variant="soft">
      {label}
    </Badge>
  );
}

function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge color={isActive ? "green" : "red"} variant="soft">
      {isActive ? "Hoạt động" : "Đã khóa"}
    </Badge>
  );
}

export function DashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    banned: users.filter((u) => !u.isActive).length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return then.toLocaleDateString("vi-VN");
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return "Đang tải...";
    return formatTimeAgo(lastUpdate.toISOString());
  };

  const donutData = [
    { label: "Hoạt động", value: stats.active, color: "var(--green-9)" },
    { label: "Đã khóa", value: stats.banned, color: "var(--red-9)" },
  ];

  const recentUsers = users.slice(0, 5);

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 400 }}>
        <Flex direction="column" align="center" gap="3">
          <Spinner size="3" />
          <Text color="gray">Đang tải dữ liệu...</Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="5">
      <Flex justify="between" align="center">
        <Heading size="6">Tổng quan</Heading>
        <Flex align="center" gap="2">
          <Text size="2" color="gray">
            Cập nhật: {formatLastUpdate()}
          </Text>
          <Box style={{ cursor: "pointer" }} onClick={fetchData}>
            <ReloadIcon width={16} height={16} color="var(--gray-9)" />
          </Box>
        </Flex>
      </Flex>

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {/* Stats */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <StatCard
          title="Tổng người dùng"
          value={stats.total}
          change="Tất cả users"
          changeType="up"
          icon={<PersonIcon width={28} height={28} />}
          color="indigo"
        />
        <StatCard
          title="Đang hoạt động"
          value={stats.active}
          change="Online"
          changeType="up"
          icon={<ChatBubbleIcon width={28} height={28} />}
          color="green"
        />
        <StatCard
          title="Đã khóa"
          value={stats.banned}
          change="Banned"
          changeType="down"
          icon={<FileTextIcon width={28} height={28} />}
          color="red"
        />
        <StatCard
          title="Quản trị viên"
          value={stats.admins}
          icon={<GearIcon width={28} height={28} />}
          color="violet"
        />
      </Box>

      {/* Charts Row */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {/* Donut Chart */}
        <Card size="2">
          <Flex direction="column" gap="3">
            <Heading size="4">Trạng thái người dùng</Heading>
            <DonutChart data={donutData} />
          </Flex>
        </Card>

        {/* Storage Info */}
        <Card size="2">
          <Flex direction="column" gap="3">
            <Heading size="4">Dung lượng lưu trữ</Heading>
            <Flex direction="column" gap="3">
              <Box
                style={{
                  width: "100%",
                  height: 8,
                  background: "var(--gray-3)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <Box
                  style={{
                    width: "35%",
                    height: "100%",
                    background: "var(--indigo-9)",
                    borderRadius: 4,
                  }}
                />
              </Box>
              <Flex justify="between">
                <Text size="2" color="gray">Đã sử dụng: 2.4 GB</Text>
                <Text size="2" color="gray">Tổng: 10 GB</Text>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      </Box>

      {/* Recent Users Table */}
      <Card size="2">
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center">
            <Heading size="4">Người dùng gần đây</Heading>
            <Text
              size="2"
              color="indigo"
              style={{ cursor: "pointer" }}
              onClick={() => window.location.href = "/admin/users"}
            >
              Xem tất cả →
            </Text>
          </Flex>

          {recentUsers.length === 0 ? (
            <Flex justify="center" align="center" p="8">
              <Text color="gray">Chưa có người dùng nào</Text>
            </Flex>
          ) : (
            <Box style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--gray-4)" }}>
                    <th style={{ textAlign: "left", padding: "12px 16px" }}>
                      <Text size="2" color="gray" weight="medium">ID</Text>
                    </th>
                    <th style={{ textAlign: "left", padding: "12px 16px" }}>
                      <Text size="2" color="gray" weight="medium">Người dùng</Text>
                    </th>
                    <th style={{ textAlign: "left", padding: "12px 16px" }}>
                      <Text size="2" color="gray" weight="medium">Email</Text>
                    </th>
                    <th style={{ textAlign: "left", padding: "12px 16px" }}>
                      <Text size="2" color="gray" weight="medium">Vai trò</Text>
                    </th>
                    <th style={{ textAlign: "left", padding: "12px 16px" }}>
                      <Text size="2" color="gray" weight="medium">Trạng thái</Text>
                    </th>
                    <th style={{ textAlign: "left", padding: "12px 16px" }}>
                      <Text size="2" color="gray" weight="medium">Hành động</Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: "1px solid var(--gray-3)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <Text size="2" color="gray">#{user.id.slice(0, 8)}</Text>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Flex gap="3" align="center">
                          <Avatar
                            size="1"
                            radius="full"
                            src={user.avatarUrl || undefined}
                            fallback={getInitials(user.fullName, user.email)}
                            color="indigo"
                          />
                          <Text size="2" weight="medium">
                            {user.fullName || "Chưa đặt tên"}
                          </Text>
                        </Flex>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Text size="2" color="gray">{user.email}</Text>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge color={user.role === "admin" ? "indigo" : "gray"} variant="soft">
                          {user.role === "admin" ? "Admin" : "User"}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <UserStatusBadge isActive={user.isActive} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Flex
                          align="center"
                          gap="1"
                          style={{ cursor: "pointer", color: "var(--indigo-9)" }}
                          onClick={() => window.location.href = `/admin/users`}
                        >
                          <Text size="2">Chi tiết</Text>
                          <ExternalLinkIcon width={12} height={12} />
                        </Flex>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Flex>
      </Card>

      {/* Quick Actions */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        <Card size="2" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/admin/users"}>
          <Flex align="center" gap="3">
            <Box style={{ color: "var(--indigo-9)" }}>
              <PlusIcon width={24} height={24} />
            </Box>
            <Text size="3" weight="medium">Thêm người dùng mới</Text>
          </Flex>
        </Card>
        <Card size="2" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/admin/reports"}>
          <Flex align="center" gap="3">
            <Box style={{ color: "var(--amber-9)" }}>
              <DownloadIcon width={24} height={24} />
            </Box>
            <Text size="3" weight="medium">Xuất báo cáo</Text>
          </Flex>
        </Card>
        <Card size="2" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/admin/settings"}>
          <Flex align="center" gap="3">
            <Box style={{ color: "var(--gray-9)" }}>
              <GearIcon width={24} height={24} />
            </Box>
            <Text size="3" weight="medium">Cài đặt hệ thống</Text>
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
}