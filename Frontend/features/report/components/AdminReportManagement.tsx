"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Select,
  Spinner,
  Text,
} from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
  FileTextIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { Fragment, memo, useCallback, useEffect, useMemo, useState } from "react";
import { usePagination } from "@/hooks/usePagination";

const REPORTS_PER_PAGE = 8;

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  lockType?: string;
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
    lockType?: string;
    lockedUntil?: string | null;
    isActive?: boolean;
  };
  recentPartners?: {
    id: string;
    fullName: string | null;
    email?: string;
    avatarUrl: string | null;
  }[];
}

const reasonLabel: Record<string, string> = {
  spam: "Spam",
  harassment: "Quấy rối",
  inappropriate_content: "Nội dung không phù hợp",
  fake_profile: "Tài khoản giả",
  underage: "Chưa đủ tuổi",
  other: "Khác",
};

const statusConfig: Record<string, { label: string; color: "yellow" | "violet" | "green" | "red" | "gray" }> = {
  pending: { label: "Chờ xử lý", color: "yellow" },
  reviewed: { label: "Đã xem xét", color: "violet" },
  resolved: { label: "Vi phạm", color: "green" },
  rejected: { label: "Từ chối", color: "red" },
};

const statusOptions = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "reviewed", label: "Đã xem xét" },
  { value: "resolved", label: "Xác nhận vi phạm" },
  { value: "rejected", label: "Từ chối" },
];

const lockOptions = [
  { value: "15_days", label: "Khóa 15 ngày" },
  { value: "30_days", label: "Khóa 30 ngày" },
  { value: "permanent", label: "Khóa vĩnh viễn" },
];

function displayName(user: { fullName: string | null; email: string }) {
  return user.fullName || user.email;
}

function initials(user: { fullName: string | null; email: string }) {
  const value = displayName(user).trim();
  return value.slice(0, 2).toUpperCase();
}

function getReportTitle(description: string | null) {
  if (!description) return "Không có tiêu đề";
  return description.split("\n").find((line) => line.trim()) || "Không có tiêu đề";
}

function getReportBody(description: string | null) {
  if (!description) return "Người dùng không nhập nội dung chi tiết.";
  const lines = description.split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.slice(1).join("\n") || lines[0] || "Người dùng không nhập nội dung chi tiết.";
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const StatCard = memo(function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <Card size="1">
      <Flex gap="3" align="center">
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: `var(--${color}-3)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: `var(--${color}-9)`,
          }}
        >
          {icon}
        </Box>
        <Flex direction="column" gap="1">
          <Text size="2" color="gray">{title}</Text>
          <Heading size="5">{value}</Heading>
        </Flex>
      </Flex>
    </Card>
  );
});

export function AdminReportManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [lockType, setLockType] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/admin/reports");
      if (!response.ok) {
        throw new Error("Không thể tải danh sách báo cáo");
      }
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError("Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((report) => report.status === "pending").length,
    resolved: reports.filter((report) => report.status === "resolved").length,
    rejected: reports.filter((report) => report.status === "rejected").length,
  }), [reports]);

  useEffect(() => {
    setExpandedId(null);
  }, [statusFilter]);

  const filteredReports = useMemo(() => (
    statusFilter === "all"
      ? reports
      : reports.filter((report) => report.status === statusFilter)
  ), [reports, statusFilter]);

  const {
    currentPage,
    pageItems: paginatedReports,
    pageStart,
    setPage,
    totalPages,
  } = usePagination(filteredReports, {
    pageSize: REPORTS_PER_PAGE,
    resetKeys: [statusFilter],
  });

  const expandedReport = reports.find((report) => report.id === expandedId) || null;

  const openReport = (report: Report) => {
    const nextId = expandedId === report.id ? null : report.id;
    setExpandedId(nextId);
    setNewStatus(report.status);
    setLockType(report.lockType && report.lockType !== "none" ? report.lockType : "");
  };

  const handleUpdateStatus = async () => {
    if (!expandedReport || !newStatus) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/v1/admin/reports/${expandedReport.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === "resolved" ? { lockType } : {}),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Cập nhật thất bại");
      }

      const updated = await response.json();
      setReports((items) => items.map((item) => item.id === updated.id ? updated : item));
      setExpandedId(updated.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể cập nhật báo cáo");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 400 }}>
        <Flex direction="column" align="center" gap="3">
          <Spinner size="3" />
          <Text color="gray">Đang tải danh sách báo cáo...</Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="5">
      <Flex justify="between" align="center" wrap="wrap" gap="3">
        <Flex direction="column" gap="1">
          <Heading size="6">Quản lý báo cáo</Heading>
          <Text size="2" color="gray">
            Xem nội dung báo cáo, đối chiếu người liên quan và khóa tài khoản khi xác nhận vi phạm.
          </Text>
        </Flex>
        <Button variant="ghost" size="1" onClick={fetchReports}>
          <ReloadIcon width={16} height={16} />
        </Button>
      </Flex>

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard title="Tổng báo cáo" value={stats.total} color="indigo" icon={<FileTextIcon width={22} height={22} />} />
        <StatCard title="Chờ xử lý" value={stats.pending} color="amber" icon={<ExclamationTriangleIcon width={22} height={22} />} />
        <StatCard title="Vi phạm" value={stats.resolved} color="green" icon={<CheckCircledIcon width={22} height={22} />} />
        <StatCard title="Từ chối" value={stats.rejected} color="red" icon={<CrossCircledIcon width={22} height={22} />} />
      </Box>

      <Card size="2">
        <Flex justify="between" align="center" gap="3" wrap="wrap">
          <Flex gap="2" wrap="wrap">
            {[
              { value: "all", label: "Tất cả" },
              { value: "pending", label: "Chờ xử lý" },
              { value: "reviewed", label: "Đã xem xét" },
              { value: "resolved", label: "Vi phạm" },
              { value: "rejected", label: "Từ chối" },
            ].map((item) => (
              <Button
                key={item.value}
                size="2"
                variant={statusFilter === item.value ? "solid" : "soft"}
                onClick={() => setStatusFilter(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </Flex>
          <Text size="2" color="gray">
            Hiển thị {filteredReports.length} / {reports.length}
          </Text>
        </Flex>
      </Card>

      <Card size="2">
        <Box style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gray-4)" }}>
                <th style={{ textAlign: "left", padding: "12px 14px", width: 130 }}>
                  <Text size="2" color="gray" weight="medium">Loại</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 14px", width: "30%" }}>
                  <Text size="2" color="gray" weight="medium">Nội dung báo cáo</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 14px", width: "18%" }}>
                  <Text size="2" color="gray" weight="medium">Người báo cáo</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 14px", width: "18%" }}>
                  <Text size="2" color="gray" weight="medium">Người bị báo cáo</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 14px", width: 120 }}>
                  <Text size="2" color="gray" weight="medium">Trạng thái</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 14px", width: 145 }}>
                  <Text size="2" color="gray" weight="medium">Ngày gửi</Text>
                </th>
                <th style={{ textAlign: "right", padding: "12px 14px", width: 96 }}>
                  <Text size="2" color="gray" weight="medium">Thao tác</Text>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.map((report) => {
                const config = statusConfig[report.status] || { label: report.status, color: "gray" as const };
                const isExpanded = expandedId === report.id;

                return (
                  <Fragment key={report.id}>
                    <tr style={{ borderBottom: isExpanded ? "0" : "1px solid var(--gray-3)" }}>
                      <td style={{ padding: "14px" }}>
                        <Badge color="indigo" variant="soft">
                          {reasonLabel[report.reason] || report.reason}
                        </Badge>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <Flex direction="column" gap="1">
                          <Text size="2" weight="medium" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {getReportTitle(report.description)}
                          </Text>
                          <Text
                            size="1"
                            color="gray"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: 1.35,
                            }}
                          >
                            {getReportBody(report.description)}
                          </Text>
                        </Flex>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <Flex gap="2" align="center" style={{ minWidth: 0 }}>
                          <Avatar size="1" radius="full" fallback={initials(report.reporter)} color="indigo" />
                          <Flex direction="column" style={{ minWidth: 0 }}>
                            <Text size="2" weight="medium" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {displayName(report.reporter)}
                            </Text>
                            <Text size="1" color="gray" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {report.reporter.email}
                            </Text>
                          </Flex>
                        </Flex>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <Flex gap="2" align="center" style={{ minWidth: 0 }}>
                          <Avatar size="1" radius="full" fallback={initials(report.reportedUser)} color="red" />
                          <Flex direction="column" style={{ minWidth: 0 }}>
                            <Text size="2" weight="medium" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {displayName(report.reportedUser)}
                            </Text>
                            <Text size="1" color="gray" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {report.reportedUser.email}
                            </Text>
                          </Flex>
                        </Flex>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <Badge color={config.color} variant="soft">
                          {config.label}
                        </Badge>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <Text size="2" color="gray">{formatDate(report.createdAt)}</Text>
                      </td>
                      <td style={{ padding: "14px", textAlign: "right" }}>
                        <Button size="1" variant={isExpanded ? "solid" : "soft"} onClick={() => openReport(report)}>
                          <EyeOpenIcon width={14} height={14} />
                        </Button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr style={{ borderBottom: "1px solid var(--gray-3)" }}>
                        <td colSpan={7} style={{ padding: "0 14px 16px" }}>
                          <Box
                            style={{
                              background: "var(--gray-2)",
                              border: "1px solid var(--gray-4)",
                              borderRadius: 8,
                              padding: 16,
                            }}
                          >
                            <Flex direction="column" gap="4">
                              <Flex direction="column" gap="2">
                                <Text size="2" weight="bold">Nội dung đầy đủ</Text>
                                <Box
                                  style={{
                                    background: "var(--gray-1)",
                                    border: "1px solid var(--gray-4)",
                                    borderRadius: 8,
                                    padding: 12,
                                    maxHeight: 180,
                                    overflowY: "auto",
                                  }}
                                >
                                  <Text size="2" style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                                    {report.description || "Người dùng không nhập nội dung chi tiết."}
                                  </Text>
                                </Box>
                              </Flex>

                              {report.recentPartners && report.recentPartners.length > 0 && (
                                <Flex direction="column" gap="2">
                                  <Text size="2" weight="bold">Người đã nói chuyện gần đây</Text>
                                  <Flex gap="2" wrap="wrap">
                                    {report.recentPartners.map((partner) => (
                                      <Badge key={partner.id} color="cyan" variant="soft">
                                        {partner.fullName || partner.email || "Ẩn danh"}
                                      </Badge>
                                    ))}
                                  </Flex>
                                </Flex>
                              )}

                              {report.reportedUser.lockType && report.reportedUser.lockType !== "none" && (
                                <Badge color="red" variant="soft" style={{ width: "fit-content" }}>
                                  Tài khoản đang bị khóa: {report.reportedUser.lockType}
                                  {report.reportedUser.lockedUntil ? ` đến ${formatDate(report.reportedUser.lockedUntil)}` : ""}
                                </Badge>
                              )}

                              <Flex justify="between" align="end" gap="3" wrap="wrap">
                                <Flex direction="column" gap="2">
                                  <Text size="2" weight="bold">Cập nhật xử lý</Text>
                                  <Flex gap="2" align="center" wrap="wrap">
                                    <Select.Root
                                      value={newStatus}
                                      onValueChange={(value) => {
                                        setNewStatus(value);
                                        if (value !== "resolved") setLockType("");
                                      }}
                                      size="2"
                                    >
                                      <Select.Trigger placeholder="Chọn trạng thái" style={{ minWidth: 180 }} />
                                      <Select.Content>
                                        {statusOptions.map((option) => (
                                          <Select.Item key={option.value} value={option.value}>
                                            {option.label}
                                          </Select.Item>
                                        ))}
                                      </Select.Content>
                                    </Select.Root>

                                    {newStatus === "resolved" && (
                                      <Select.Root value={lockType} onValueChange={setLockType} size="2">
                                        <Select.Trigger placeholder="Chọn mức khóa" style={{ minWidth: 180 }} />
                                        <Select.Content>
                                          {lockOptions.map((option) => (
                                            <Select.Item key={option.value} value={option.value}>
                                              {option.label}
                                            </Select.Item>
                                          ))}
                                        </Select.Content>
                                      </Select.Root>
                                    )}
                                  </Flex>
                                </Flex>

                                <Button
                                  size="2"
                                  color="green"
                                  onClick={handleUpdateStatus}
                                  disabled={!newStatus || updating || (newStatus === "resolved" && !lockType)}
                                  loading={updating}
                                >
                                  {updating ? "Đang cập nhật..." : "Cập nhật"}
                                </Button>
                              </Flex>
                            </Flex>
                          </Box>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          {filteredReports.length === 0 && (
            <Flex justify="center" align="center" p="8" direction="column" gap="2">
              <FileTextIcon width={48} height={48} color="var(--gray-6)" />
              <Text size="3" color="gray">Không có báo cáo nào</Text>
            </Flex>
          )}
        </Box>

        {filteredReports.length > 0 && (
          <Flex justify="between" align="center" gap="3" mt="4" wrap="wrap">
            <Text size="2" color="gray">
              Hiển thị {pageStart + 1}-{Math.min(pageStart + REPORTS_PER_PAGE, filteredReports.length)} / {filteredReports.length}
            </Text>
            <Flex align="center" gap="2">
              <Button
                size="2"
                variant="soft"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                <ChevronLeftIcon width={16} height={16} />
                Trước
              </Button>
              <Text size="2" color="gray">
                Trang {currentPage} / {totalPages}
              </Text>
              <Button
                size="2"
                variant="soft"
                disabled={currentPage === totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Sau
                <ChevronRightIcon width={16} height={16} />
              </Button>
            </Flex>
          </Flex>
        )}
      </Card>
    </Flex>
  );
}
