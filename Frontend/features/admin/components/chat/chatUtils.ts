import type { AdminConversation } from "@/features/athu";

export type ChatStatusFilter = "all" | AdminConversation["status"];

export function formatChatTimeAgo(date: string) {
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
}

export function formatChatDate(date: string) {
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getChatInitials(name: string | null | undefined, fallback: string) {
  if (!name) return fallback.slice(0, 2).toUpperCase();
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getChatUserName(
  user: AdminConversation["user1"] | AdminConversation["user2"] | undefined,
  fallback: string,
) {
  return user?.fullName || user?.email || fallback;
}
