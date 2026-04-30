import { cookies } from "next/headers";
import type { AdminUser } from "@/features/auth/types";
import { getBackendUrl } from "./backend-url";

export interface AdminUserRecord {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "suspended";
  team: string;
  lastSeen: string;
  joinedAt: string;
  openCases: number;
}

export async function fetchAdminUsers(): Promise<AdminUserRecord[]> {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    throw new Error("Missing backend URL configuration.");
  }

  const cookieHeader = await buildAuthCookieHeader();
  const response = await fetch(`${backendUrl}/admin/users`, {
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch admin users: ${response.status}`);
  }

  const users = (await response.json()) as AdminUser[];
  return users.map(mapAdminUserRecord);
}

export async function fetchAdminUserById(
  id: string,
): Promise<AdminUserRecord | null> {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    throw new Error("Missing backend URL configuration.");
  }

  const cookieHeader = await buildAuthCookieHeader();
  const response = await fetch(`${backendUrl}/admin/users/${id}`, {
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch admin user: ${response.status}`);
  }

  const user = (await response.json()) as AdminUser;
  return mapAdminUserRecord(user);
}

async function buildAuthCookieHeader() {
  const cookieStore = await cookies();
  const entries = ["access_token", "refresh_token", "user_id"]
    .map((name) => {
      const value = cookieStore.get(name)?.value;
      return value ? `${name}=${encodeURIComponent(value)}` : null;
    })
    .filter(Boolean);

  return entries.join("; ");
}

function mapAdminUserRecord(user: AdminUser): AdminUserRecord {
  return {
    id: user.id,
    fullName: user.fullName || user.email,
    email: user.email,
    role: user.role,
    status: user.isActive ? "active" : "suspended",
    team: user.role === "admin" ? "Administration" : "Operations",
    lastSeen: formatRelativeLabel(user.updatedAt),
    joinedAt: formatDate(user.createdAt),
    openCases: user.role === "admin" ? 2 : 0,
  };
}

function formatDate(value?: string) {
  if (!value) {
    return "Chua cap nhat";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chua cap nhat";
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function formatRelativeLabel(value?: string) {
  if (!value) {
    return "Chua cap nhat";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chua cap nhat";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} phut truoc`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} gio truoc`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngay truoc`;
}
