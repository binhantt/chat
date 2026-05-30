import type { AdminUser } from "@/features/athu";

export function getUserInitials(name: string | null, email: string) {
  if (!name) return email.slice(0, 2).toUpperCase();
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatAdminDate(date?: string | null) {
  if (!date) return "Chưa cập nhật";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatAdminDateTime(date?: string | null) {
  if (!date) return "Chưa cập nhật";
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatAdminValue(value?: string | null) {
  return value && value.trim() ? value : "Chưa cập nhật";
}

export function formatAdminCity(city?: string | null) {
  if (city === "TP. Ho Chi Minh") return "TP. Hồ Chí Minh";
  if (city === "Ha Noi") return "Hà Nội";
  return formatAdminValue(city);
}

export function isUserLocked(user: AdminUser) {
  return !user.isActive || Boolean(user.lockType && user.lockType !== "none");
}

export function genderLabel(gender?: AdminUser["gender"]) {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";
  if (gender === "other") return "Khác";
  return "Chưa cập nhật";
}
