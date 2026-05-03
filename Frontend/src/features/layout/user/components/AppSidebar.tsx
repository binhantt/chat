"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flex, Text } from "@radix-ui/themes";
import { ChatBubbleIcon, ExclamationTriangleIcon, PersonIcon } from "@radix-ui/react-icons";
import { getStoredProfile } from "@/features/profile/types";
import type { UserProfile } from "@/features/profile/types";

const NAV = [
  { href: "/find", Icon: ChatBubbleIcon, label: "Trò chuyện" },
  { href: "/report", Icon: ExclamationTriangleIcon, label: "Báo cáo" },
];

export function AppSidebar() {
  const path = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => { setProfile(getStoredProfile()); }, []);

  return (
    <aside style={{ width: 240, minWidth: 240, height: "100dvh", background: "#0f172a", display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
      {/* Logo */}
      <Flex align="center" gap="2" style={{ padding: "22px 20px 16px" }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#0891b2,#0284c7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(8,145,178,0.3)", flexShrink: 0 }}>
          <ChatBubbleIcon width={18} height={18} color="white" />
        </div>
        <div>
          <Text size="3" weight="bold" style={{ color: "#f1f5f9", letterSpacing: "-0.02em", display: "block", lineHeight: 1.2 }}>Chat vs</Text>
          <Text size="3" weight="bold" style={{ color: "#0891b2", letterSpacing: "-0.02em", display: "block", lineHeight: 1.2 }}>Người Lạ 2</Text>
        </div>
      </Flex>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 8 }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        <Text size="1" style={{ color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 12px 6px", display: "block", fontWeight: 600 }}>Điều hướng</Text>
        {NAV.map(({ href, Icon, label }) => {
          const active = path === href || (href === "/find" && path.startsWith("/chat"));
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <Flex align="center" gap="3" style={{ padding: "10px 12px", borderRadius: 10, background: active ? "rgba(8,145,178,0.15)" : "transparent", border: `1px solid ${active ? "rgba(8,145,178,0.25)" : "transparent"}`, transition: "all 0.15s", cursor: "pointer" }}>
                <Icon width={16} height={16} color={active ? "#38bdf8" : "#64748b"} />
                <Text size="2" weight={active ? "semibold" : "regular"} style={{ color: active ? "#38bdf8" : "#94a3b8" }}>{label}</Text>
              </Flex>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />
      <Flex align="center" gap="3" style={{ padding: "16px 20px" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#334155,#475569)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <PersonIcon width={16} height={16} color="#94a3b8" />
        </div>
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <Text size="2" weight="semibold" style={{ color: "#f1f5f9", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile?.name ?? "Người dùng"}
          </Text>
          <Text size="1" style={{ color: "#64748b" }}>
            {profile ? `${profile.age} tuổi · ${profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : "Khác"}` : "Chưa cài đặt"}
          </Text>
        </div>
      </Flex>
    </aside>
  );
}
