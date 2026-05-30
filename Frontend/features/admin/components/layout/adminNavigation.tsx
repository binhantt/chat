import type { ReactNode } from "react";
import {
  ChatBubbleIcon,
  DashboardIcon,
  FileTextIcon,
  GearIcon,
  LockClosedIcon,
  PersonIcon,
  StarIcon,
} from "@radix-ui/react-icons";

export type AdminNavItem = {
  href: string;
  icon: ReactNode;
  label: string;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", icon: <DashboardIcon />, label: "Tổng quan" },
  { href: "/admin/users", icon: <PersonIcon />, label: "Người dùng" },
  { href: "/admin/chats", icon: <ChatBubbleIcon />, label: "Tin nhắn" },
  { href: "/admin/conduct", icon: <LockClosedIcon />, label: "Ứng xử" },
  { href: "/admin/reports", icon: <FileTextIcon />, label: "Báo cáo" },
  { href: "/admin/vip", icon: <StarIcon />, label: "Gói VIP" },
  { href: "/admin/settings", icon: <GearIcon />, label: "Cài đặt" },
];

export function isActiveAdminPath(pathname: string, href: string) {
  const normalizedPath = pathname.split("?")[0]?.replace(/\/$/, "") || "/admin";
  const normalizedHref = href.replace(/\/$/, "");

  if (normalizedHref === "/admin") {
    return normalizedPath === "/admin";
  }

  return normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`);
}
