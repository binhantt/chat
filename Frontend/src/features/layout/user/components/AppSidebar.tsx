"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Flex, Text } from "@radix-ui/themes";
import { ChatBubbleIcon, ExclamationTriangleIcon, PersonIcon, GearIcon, ExitIcon } from "@radix-ui/react-icons";
import { getStoredProfile, PROFILE_KEY } from "@/features/profile/types";
import type { UserProfile } from "@/features/profile/types";

const NAV = [
  { href: "/find", Icon: ChatBubbleIcon, label: "Trò chuyện" },
  { href: "/report", Icon: ExclamationTriangleIcon, label: "Báo cáo" },
  { href: "/profile-setup", Icon: GearIcon, label: "Hồ sơ" },
];

export function AppSidebar() {
  const path = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => { setProfile(getStoredProfile()); }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem(PROFILE_KEY);
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <aside style={{ width: 240, minWidth: 240, height: "100dvh", background: "#ffffff", display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0", flexShrink: 0 }}>
      {/* Logo */}
      <Flex align="center" gap="2" style={{ padding: "22px 20px 16px" }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#0891b2,#0284c7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(8,145,178,0.3)", flexShrink: 0 }}>
          <ChatBubbleIcon width={18} height={18} color="white" />
        </div>
        <div>
          <Text size="3" weight="bold" style={{ color: "#0f172a", letterSpacing: "-0.02em", display: "block", lineHeight: 1.2 }}>Chat vs</Text>
          <Text size="3" weight="bold" style={{ color: "#0891b2", letterSpacing: "-0.02em", display: "block", lineHeight: 1.2 }}>Người Lạ 2</Text>
        </div>
      </Flex>

      <div style={{ height: 1, background: "#e2e8f0", marginBottom: 8 }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        <Text size="1" style={{ color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 12px 6px", display: "block", fontWeight: 600 }}>Điều hướng</Text>
        {NAV.map(({ href, Icon, label }) => {
          const active = path === href || (href === "/find" && path.startsWith("/chat"));
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <Flex align="center" gap="3" style={{ padding: "10px 12px", borderRadius: 10, background: active ? "rgba(8,145,178,0.1)" : "transparent", border: `1px solid ${active ? "rgba(8,145,178,0.2)" : "transparent"}`, transition: "all 0.15s", cursor: "pointer" }}>
                <Icon width={16} height={16} color={active ? "#0891b2" : "#64748b"} />
                <Text size="2" weight={active ? "bold" : "regular"} style={{ color: active ? "#0891b2" : "#475569" }}>{label}</Text>
              </Flex>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ height: 1, background: "#e2e8f0" }} />
      <Flex align="center" gap="3" style={{ padding: "16px 20px" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#cbd5e1,#e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <PersonIcon width={16} height={16} color="#64748b" />
        </div>
        <div style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
          <Text size="2" weight="bold" style={{ color: "#0f172a", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile?.name ?? "Người dùng"}
          </Text>
          <Text size="1" style={{ color: "#64748b" }}>
            {profile ? `${profile.age} tuổi · ${profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : "Khác"}` : "Chưa cài đặt"}
          </Text>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          title="Đăng xuất"
        >
          <ExitIcon width={18} height={18} color="#ef4444" />
        </button>
      </Flex>
    </aside>
  );
}
