import type { AdminReport } from "./types";

export const reportReasonLabel: Record<string, string> = {
  fake_profile: "Tài khoản giả",
  harassment: "Quấy rối",
  inappropriate_content: "Nội dung không phù hợp",
  other: "Khác",
  spam: "Spam",
  underage: "Chưa đủ tuổi",
};

export const reportStatusConfig: Record<
  string,
  { color: "gray" | "green" | "red" | "violet" | "yellow"; label: string }
> = {
  pending: { color: "yellow", label: "Chờ xử lý" },
  rejected: { color: "red", label: "Từ chối" },
  resolved: { color: "green", label: "Vi phạm" },
  reviewed: { color: "violet", label: "Đã xem xét" },
};

export const reportStatusOptions = [
  { label: "Chờ xử lý", value: "pending" },
  { label: "Đã xem xét", value: "reviewed" },
  { label: "Xác nhận vi phạm", value: "resolved" },
  { label: "Từ chối", value: "rejected" },
];

export const reportLockOptions = [
  { label: "Khóa 15 ngày", value: "15_days" },
  { label: "Khóa 30 ngày", value: "30_days" },
  { label: "Khóa vĩnh viễn", value: "permanent" },
];

export function displayReportUser(user: { email: string; fullName: string | null }) {
  return user.fullName || user.email;
}

export function getReportInitials(user: { email: string; fullName: string | null }) {
  return displayReportUser(user).trim().slice(0, 2).toUpperCase();
}

export function getReportTitle(description: string | null) {
  if (!description) return "Không có tiêu đề";
  return description.split("\n").find((line) => line.trim()) || "Không có tiêu đề";
}

export function getReportBody(description: string | null) {
  if (!description) return "Người dùng không nhập nội dung chi tiết.";
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.slice(1).join("\n") || lines[0] || "Người dùng không nhập nội dung chi tiết.";
}

export function formatReportDate(dateString: string) {
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getReportStatus(report: AdminReport) {
  return reportStatusConfig[report.status] || { color: "gray" as const, label: report.status };
}
