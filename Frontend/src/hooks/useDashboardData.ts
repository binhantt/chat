import { useEffect, useState } from "react";

export function useDashboardData() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    { label: "Hoi thoai dang mo", value: "128", detail: "+12 hom nay", trend: "up" as const },
    { label: "Yeu cau can xu ly", value: "09", detail: "3 muc uu tien cao", trend: "down" as const },
    { label: "Admin dang online", value: "06", detail: "2 nguoi truc chat", trend: "neutral" as const },
  ];

  const activity = [
    {
      title: "Hang doi chat duoc cap nhat",
      time: "05 phut truoc",
      detail: "12 hoi thoai moi da duoc dua vao nhom can theo doi.",
    },
    {
      title: "Quyen truy cap duoc thay doi",
      time: "18 phut truoc",
      detail: "1 tai khoan moderator vua duoc nang cap thanh admin khu vuc.",
    },
    {
      title: "Session duoc gia han",
      time: "32 phut truoc",
      detail: "He thong xac nhan refresh token van hop le.",
    },
  ];

  const health = [
    { label: "Proxy login", status: "On", tone: "text-emerald-700 bg-emerald-50" },
    { label: "Cookie session", status: "Healthy", tone: "text-cyan-700 bg-cyan-50" },
    { label: "Backend auth", status: "Stable", tone: "text-slate-700 bg-slate-100" },
  ];

  const chartData = [
    { day: "T2", chats: 120, height: "40%" },
    { day: "T3", chats: 180, height: "60%" },
    { day: "T4", chats: 250, height: "80%" },
    { day: "T5", chats: 100, height: "35%" },
    { day: "T6", chats: 190, height: "65%" },
    { day: "T7", chats: 290, height: "90%" },
    { day: "CN", chats: 320, height: "100%" },
  ];

  return { loading, metrics, activity, health, chartData };
}
