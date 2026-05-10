'use client';

import { Flex, Text, Box, Button } from "@radix-ui/themes";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const API_URL = "/api/match";

export enum MatchStatus {
  Idle = "idle",
  Searching = "searching",
  Matched = "matched",
  NotFound = "not_found",
}

interface MatchResult {
  conversationId: string;
  matchedUserId: string;
  matchedUser: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    gender: string | null;
    city: string | null;
  };
}

interface MatchPeopleProps {
  onMatched: (conversationId: string, matchedUser: MatchResult["matchedUser"]) => void;
  onCancel: () => void;
}

export function MatchPeople({ onMatched, onCancel }: MatchPeopleProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Theme colors
  const bgPrimary = isDark ? "#1a1a2e" : "#ffffff";
  const textPrimary = isDark ? "#e2e8f0" : "#1e293b";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const accentColor = "#6366f1";
  const greenColor = "#22c55e";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  const [status, setStatus] = useState<MatchStatus>(MatchStatus.Idle);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkMatchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/status`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();

        if (data.conversationId && data.matchedWithUserId) {
          setStatus(MatchStatus.Matched);
          stopPolling();

          setMatchResult({
            conversationId: data.conversationId,
            matchedUserId: data.matchedWithUserId,
            matchedUser: data.matchedUser || {
              id: data.matchedWithUserId,
              email: "",
              fullName: null,
              avatarUrl: null,
              gender: null,
              city: null,
            },
          });
        } else if (data.status === "cancelled" || data.status === "expired") {
          setStatus(MatchStatus.NotFound);
          stopPolling();
        }
      }
    } catch (error) {
      console.error("Error checking match status:", error);
    }
  }, [user?.id]);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    pollingIntervalRef.current = setInterval(checkMatchStatus, 5000);
  }, [checkMatchStatus]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const handleStartSearch = async () => {
    setStatus(MatchStatus.Searching);

    try {
      const res = await fetch(`${API_URL}/join`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        setStatus(MatchStatus.Idle);
        return;
      }

      startPolling();
    } catch (error) {
      setStatus(MatchStatus.Idle);
    }
  };

  const handleStopSearch = async () => {
    stopPolling();

    try {
      await fetch(`${API_URL}/leave`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error leaving queue:", error);
    }

    setStatus(MatchStatus.Idle);
  };

  const handleMatchedAccept = () => {
    if (matchResult) {
      onMatched(matchResult.conversationId, matchResult.matchedUser);
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
      if (status === MatchStatus.Searching) {
        fetch(`${API_URL}/leave`, {
          method: "DELETE",
          credentials: "include",
        }).catch(console.error);
      }
    };
  }, []);

  const getUserInitials = (name: string | null | undefined, email: string) => {
    if (!name) return email.slice(0, 2).toUpperCase();
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Helper to get search text based on user gender
  const getSearchText = () => {
    if (user?.gender === "male") return "Tìm kiếm nữ cùng thành phố";
    if (user?.gender === "female") return "Tìm kiếm nam cùng thành phố";
    return "Cập nhật giới tính để tìm người phù hợp";
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      style={{
        minHeight: "calc(100vh - 200px)",
        background: bgPrimary,
        borderRadius: 24,
        padding: "60px 40px",
        width: "100%",
      }}
    >
      {/* Idle State - Default view */}
      {status === MatchStatus.Idle && (
        <Flex direction="column" align="center" gap="5" style={{ width: "100%", maxWidth: 400 }}>
          {/* Icon Circle */}
          <Box
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 12px 40px rgba(99, 102, 241, 0.35)`,
            }}
          >
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Box>

          {/* Title & Description */}
          <Flex direction="column" align="center" gap="2">
            <Text size="6" weight="bold" style={{ color: textPrimary }}>
              Tìm người trò chuyện
            </Text>
            <Text size="3" style={{ color: textSecondary }}>
              {getSearchText()}
            </Text>
          </Flex>

          {/* Warning if missing info */}
          {(!user?.gender || !user?.city) && (
            <Box
              style={{
                padding: "12px 20px",
                borderRadius: 12,
                background: "rgba(245, 158, 11, 0.1)",
                maxWidth: 320,
              }}
            >
              <Text size="2" style={{ color: "#f59e0b", textAlign: "center" }}>
                Vui lòng cập nhật giới tính và thành phố trong phần giới thiệu trước
              </Text>
            </Box>
          )}

          {/* Action Button */}
          <Button
            size="3"
            onClick={handleStartSearch}
            disabled={!user?.gender || !user?.city}
            style={{
              padding: "14px 40px",
              fontSize: "15px",
              fontWeight: 600,
              borderRadius: 12,
              background: user?.gender && user?.city
                ? `linear-gradient(135deg, ${greenColor}, #10b981)`
                : isDark ? "#374151" : "#cbd5e1",
              color: "white",
              border: "none",
              boxShadow: user?.gender && user?.city
                ? "0 6px 20px rgba(34, 197, 94, 0.35)"
                : "none",
            }}
          >
            Bắt đầu tìm kiếm
          </Button>
        </Flex>
      )}

      {/* Searching State */}
      {status === MatchStatus.Searching && (
        <Flex direction="column" align="center" gap="5">
          {/* Animated Icon */}
          <Box
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 12px 40px rgba(99, 102, 241, 0.4)`,
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.3)",
                animation: "bounce 1s ease-in-out infinite",
              }}
            />
          </Box>

          {/* Text */}
          <Flex direction="column" align="center" gap="2">
            <Text size="6" weight="bold" style={{ color: accentColor }}>
              Đang tìm kiếm...
            </Text>
            <Text size="3" style={{ color: textSecondary }}>
              Vui lòng đợi trong giây lát
            </Text>
          </Flex>

          {/* Cancel Button */}
          <Button
            variant="soft"
            size="3"
            onClick={handleStopSearch}
            style={{
              padding: "12px 32px",
              fontWeight: 600,
              borderRadius: 12,
              color: textSecondary,
            }}
          >
            Hủy
          </Button>
        </Flex>
      )}

      {/* Not Found State */}
      {status === MatchStatus.NotFound && (
        <Flex direction="column" align="center" gap="5">
          {/* Icon */}
          <Box
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: isDark ? "#374151" : "#e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke={textSecondary} strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </Box>

          {/* Text */}
          <Flex direction="column" align="center" gap="2">
            <Text size="6" weight="bold" style={{ color: textPrimary }}>
              Không tìm thấy ai
            </Text>
            <Text size="3" style={{ color: textSecondary }}>
              Hiện không có người nào cùng thành phố đang online
            </Text>
          </Flex>

          {/* Retry Button */}
          <Button
            variant="soft"
            size="3"
            onClick={() => setStatus(MatchStatus.Idle)}
            style={{
              padding: "12px 32px",
              fontWeight: 600,
              borderRadius: 12,
            }}
          >
            Thử lại
          </Button>
        </Flex>
      )}

      {/* Matched State */}
      {status === MatchStatus.Matched && matchResult && (
        <Flex direction="column" align="center" gap="5">
          {/* Avatar Circle */}
          <Box
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${greenColor}, #10b981)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 12px 40px rgba(34, 197, 94, 0.4)`,
            }}
          >
            <Box
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: "bold",
                color: "white",
              }}
            >
              {getUserInitials(matchResult.matchedUser.fullName, matchResult.matchedUser.email)}
            </Box>
          </Box>

          {/* User Info */}
          <Flex direction="column" align="center" gap="2">
            <Text size="6" weight="bold" style={{ color: greenColor }}>
              Đã tìm thấy!
            </Text>
            <Text size="4" weight="medium" style={{ color: textPrimary }}>
              {matchResult.matchedUser.fullName || matchResult.matchedUser.email}
            </Text>
            {matchResult.matchedUser.city && (
              <Text size="2" style={{ color: textSecondary }}>
                📍 {matchResult.matchedUser.city}
              </Text>
            )}
          </Flex>

          {/* Action Buttons */}
          <Flex gap="3">
            <Button
              variant="soft"
              size="3"
              onClick={() => {
                setMatchResult(null);
                setStatus(MatchStatus.Idle);
              }}
              style={{
                padding: "12px 28px",
                fontWeight: 600,
                borderRadius: 12,
                color: textSecondary,
              }}
            >
              Hủy
            </Button>
            <Button
              size="3"
              onClick={handleMatchedAccept}
              style={{
                padding: "12px 28px",
                fontWeight: 600,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${greenColor}, #10b981)`,
                color: "white",
                border: "none",
                boxShadow: "0 6px 20px rgba(34, 197, 94, 0.35)",
              }}
            >
              Bắt đầu trò chuyện
            </Button>
          </Flex>
        </Flex>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Flex>
  );
}