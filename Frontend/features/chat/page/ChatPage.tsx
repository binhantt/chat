"use client";

import { Flex, Text, Box, Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { ChatIcon3D, ChatArea } from "../components";
import { MatchPeople } from "../components/MatchPeople";
import { SearchPeople } from "../components/SearchPeople";

interface MatchedUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  gender: string | null;
  city: string | null;
}

export function ChatPage() {
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<MatchedUser | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const bgPrimary = isDark ? "#1a1a2e" : "#f8fafc";
  const bgSecondary = isDark ? "#16213e" : "#ffffff";
  const textPrimary = isDark ? "#e2e8f0" : "#1e293b";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";

  useEffect(() => {
    const convParam = searchParams.get("conv");
    const userParam = searchParams.get("user");
    if (convParam && userParam) {
      setConversationId(convParam);
      setSelectedUser(userParam);
      setMatchedUser({
        id: userParam,
        email: "",
        fullName: null,
        avatarUrl: null,
        gender: null,
        city: null,
      });
    }
  }, [searchParams]);

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
    setShowSearch(false);
    setShowMatch(false);
    setMatchedUser(null);
    setConversationId(null);
  };

  const handleSearchClick = () => {
    setShowSearch(true);
    setShowMatch(false);
  };

  const handleMatchClick = () => {
    setShowMatch(true);
    setShowSearch(false);
  };

  const handleBack = () => {
    setShowSearch(false);
    setShowMatch(false);
    setSelectedUser(null);
    setMatchedUser(null);
    setConversationId(null);
  };

  const handleMatched = (convId: string, matched: MatchedUser) => {
    setConversationId(convId);
    setMatchedUser(matched);
    setSelectedUser(matched.id);
    setShowSearch(false);
    setShowMatch(false);
  };

  const handleCancelMatch = () => {
    setMatchedUser(null);
    setConversationId(null);
    setShowSearch(false);
    setShowMatch(false);
  };

  // Welcome Screen
  if (!selectedUser && !showSearch && !showMatch && !matchedUser) {
    return (
      <Box
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bgPrimary,
          padding: 24,
        }}
      >
        <Flex direction="column" align="center" gap="6" style={{ maxWidth: 680 }}>
          {/* Icon */}
          <Box
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 16px 48px rgba(99, 102, 241, 0.3)`,
            }}
          >
            <ChatIcon3D size={48} />
          </Box>

          {/* Title & Description */}
          <Flex direction="column" align="center" gap="2">
            <Text size="6" weight="bold" style={{ color: textPrimary }}>
              Chào mừng đến ChatApp
            </Text>
            <Text size="3" style={{ color: textSecondary, textAlign: "center", maxWidth: 400 }}>
              Kết nối với những người cùng thành phố và bắt đầu cuộc trò chuyện thú vị
            </Text>
          </Flex>

          {/* Action Buttons */}
          <Flex gap="4" justify="center" wrap="wrap">
            {/* Tìm kiếm Button */}
            <Box
              as="button"
              onClick={handleSearchClick}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "24px 32px",
                background: bgSecondary,
                border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                borderRadius: 20,
                cursor: "pointer",
                boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.06)",
                transition: "all 0.2s",
                minWidth: 200,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Box
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </Box>
              <Flex direction="column" align="center" gap="0">
                <Text size="3" weight="bold" style={{ color: textPrimary }}>Tìm kiếm</Text>
                <Text size="2" style={{ color: textSecondary }}>Tìm theo tên</Text>
              </Flex>
            </Box>

            {/* Ghép đôi Button */}
            <Box
              as="button"
              onClick={handleMatchClick}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "24px 32px",
                background: bgSecondary,
                border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                borderRadius: 20,
                cursor: "pointer",
                boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.06)",
                transition: "all 0.2s",
                minWidth: 200,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#22c55e";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Box
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #22c55e, #10b981)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </Box>
              <Flex direction="column" align="center" gap="0">
                <Text size="3" weight="bold" style={{ color: textPrimary }}>Ghép đôi</Text>
                <Text size="2" style={{ color: textSecondary }}>Cùng thành phố</Text>
              </Flex>
            </Box>
          </Flex>
        </Flex>
      </Box>
    );
  }

  // Search Screen
  if (!selectedUser && showSearch) {
    return (
      <Box style={{ width: "100%", height: "100vh", background: bgPrimary, padding: 24 }}>
        <Flex align="center" gap="3" mb="5">
          <Button variant="ghost" size="2" onClick={handleBack} style={{ color: textSecondary }}>
            ← Quay lại
          </Button>
          <Text size="5" weight="bold" style={{ color: textPrimary }}>
            Tìm kiếm người trò chuyện
          </Text>
        </Flex>
        <Box style={{ maxWidth: 520, margin: "0 auto" }}>
          <SearchPeople />
        </Box>
      </Box>
    );
  }

  // Match Screen
  if (!selectedUser && showMatch) {
    return (
      <Box style={{ width: "100%", height: "100vh", background: bgPrimary, padding: 24 }}>
        <Flex align="center" gap="3" mb="5">
          <Button variant="ghost" size="2" onClick={handleBack} style={{ color: textSecondary }}>
            ← Quay lại
          </Button>
          <Text size="5" weight="bold" style={{ color: textPrimary }}>
            Ghép đôi ngẫu nhiên
          </Text>
        </Flex>
        <Box style={{ maxWidth: 480, margin: "0 auto" }}>
          <MatchPeople onMatched={handleMatched} onCancel={handleCancelMatch} />
        </Box>
      </Box>
    );
  }

  // Matched Result Screen
  if (matchedUser && conversationId && !selectedUser) {
    return (
      <Box style={{ width: "100%", height: "100vh", background: bgPrimary, padding: 24 }}>
        <Flex align="center" gap="3" mb="5">
          <Button variant="ghost" size="2" onClick={handleCancelMatch} style={{ color: textSecondary }}>
            ← Quay lại
          </Button>
          <Text size="4" weight="bold" style={{ color: "#22c55e" }}>
            Đã ghép đôi thành công!
          </Text>
        </Flex>
      </Box>
    );
  }

  // Chat Area
  return (
    <Box style={{ width: "100%", height: "100vh" }}>
      <ChatArea
        selectedUser={selectedUser!}
        matchedUser={matchedUser}
        conversationId={conversationId}
        onBack={handleBack}
      />
    </Box>
  );
}