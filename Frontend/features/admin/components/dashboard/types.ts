import type { ReactNode } from "react";
import type { AdminUser } from "@/features/athu";

export type AdminDashboardStats = {
  active: number;
  banned: number;
  total: number;
};

export type AdminStatItem = {
  icon: ReactNode;
  label: string;
  value: number;
};

export type AdminDashboardProps = {
  error: string | null;
  recentUsers: AdminUser[];
  stats: AdminDashboardStats;
};
