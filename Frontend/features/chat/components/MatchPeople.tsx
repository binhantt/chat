'use client';

import { Flex, Text, Box, Button, Spinner, Avatar } from "@radix-ui/themes";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
  const [status, setStatus] = useState<MatchStatus>(MatchStatus.Idle);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkMatchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/status`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();

        if (data.conversationId && data.matchedWithUserId) {
          // Đã match thành công
          setStatus(MatchStatus.Matched);
          stopPolling();

          // matchedUser đã có sẵn trong status response
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
    setErrorMessage("");

    try {
      const res = await fetch(`${API_URL}/join`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        setStatus(MatchStatus.Idle);
        setErrorMessage(error.message || "Không thể bắt đầu tìm kiếm");
        return;
      }

      // Bắt đầu polling để kiểm tra trạng thái match
      startPolling();
    } catch (error) {
      setStatus(MatchStatus.Idle);
      setErrorMessage("Đã xảy ra lỗi khi tìm kiếm");
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

  // Cleanup when unmount
  useEffect(() => {
    return () => {
      stopPolling();
      // Khi unmount mà đang tìm kiếm, tự động leave queue
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

  return (
    <Flex direction="column" align="center" justify={"center"} gap="4" style={{ padding: "20px" }}>
      {status === MatchStatus.Idle && (
        <>
          <Box style={{ perspective: 600 }}>
            <Box style={{ animation: "searchPulse 1.5s ease-in-out infinite" }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--indigo-9)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Box>
          </Box>

          <Flex direction="column" align="center" gap="2">
            <Text size="5" weight="bold" color="indigo">
              Tìm người trò chuyện
            </Text>
            <Text size="2" color="gray" align="center" style={{ maxWidth: 300 }}>
              {user?.gender === "male"
                ? "Tìm kiếm nữ cùng thành phố"
                : user?.gender === "female"
                ? "Tìm kiếm nam cùng thành phố"
                : "Cập nhật giới tính để tìm người phù hợp"
              }
            </Text>
          </Flex>

          {errorMessage && (
            <Text size="2" color="red">{errorMessage}</Text>
          )}

          <Button
            size="3"
            color="indigo"
            onClick={handleStartSearch}
            disabled={!user?.gender || !user?.city}
            style={{ cursor: "pointer", padding: "12px 32px" }}
          >
            Bắt đầu tìm kiếm
          </Button>

          {(!user?.gender || !user?.city) && (
            <Text size="1" color="orange" align="center" style={{ maxWidth: 250 }}>
              Vui lòng cập nhật giới tính và thành phố trong phần giới thiệu trước
            </Text>
          )}
        </>
      )}

      {status === MatchStatus.Searching && (
        <>
          <Box>
            <Spinner size="3" />
          </Box>

          <Flex direction="column" align="center" gap="2">
            <Text size="5" weight="bold" color="indigo">
              Đang tìm kiếm...
            </Text>
            <Text size="2" color="gray" align="center">
              Vui lòng đợi trong giây lát
            </Text>
          </Flex>

          <Flex gap="2" style={{ marginTop: 20 }}>
            <Box
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--indigo-9)",
                animation: "dotPulse 1s ease-in-out infinite",
              }}
            />
            <Box
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--indigo-7)",
                animation: "dotPulse 1s ease-in-out infinite 0.2s",
              }}
            />
            <Box
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--indigo-5)",
                animation: "dotPulse 1s ease-in-out infinite 0.4s",
              }}
            />
          </Flex>

          <Button
            variant="outline"
            color="red"
            size="2"
            onClick={handleStopSearch}
            style={{ cursor: "pointer", marginTop: 20 }}
          >
            Hủy tìm kiếm
          </Button>
        </>
      )}

      {status === MatchStatus.NotFound && (
        <>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--gray-9)" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>

          <Flex direction="column" align="center" gap="2">
            <Text size="5" weight="bold" color="gray">
              Không tìm thấy ai
            </Text>
            <Text size="2" color="gray" align="center">
              Hiện không có người nào cùng thành phố đang online
            </Text>
          </Flex>

          <Button
            variant="outline"
            color="indigo"
            onClick={() => setStatus(MatchStatus.Idle)}
            style={{ cursor: "pointer" }}
          >
            Thử lại
          </Button>
        </>
      )}

      {status === MatchStatus.Matched && matchResult && (
        <>
          <Box
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "var(--indigo-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "matchGlow 1.5s ease-in-out infinite",
            }}
          >
            <Avatar
              size="5"
              radius="full"
              src={matchResult.matchedUser.avatarUrl || undefined}
              fallback={getUserInitials(matchResult.matchedUser.fullName, matchResult.matchedUser.email)}
              style={{ background: "var(--indigo-9)", color: "white" }}
            />
          </Box>

          <Flex direction="column" align="center" gap="2">
            <Text size="5" weight="bold" color="green">
              Đã tìm thấy!
            </Text>
            <Text size="3" weight="medium">
              {matchResult.matchedUser.fullName || matchResult.matchedUser.email}
            </Text>
            {matchResult.matchedUser.city && (
              <Text size="2" color="gray">
                📍 {matchResult.matchedUser.city}
              </Text>
            )}
          </Flex>

          <Flex gap="3" style={{ marginTop: 20 }}>
            <Button
              variant="outline"
              color="red"
              onClick={() => {
                setMatchResult(null);
                setStatus(MatchStatus.Idle);
              }}
              style={{ cursor: "pointer" }}
            >
              Hủy
            </Button>
            <Button
              color="green"
              onClick={handleMatchedAccept}
              style={{ cursor: "pointer" }}
            >
              Bắt đầu trò chuyện
            </Button>
          </Flex>
        </>
      )}

      <style>{`
        @keyframes searchPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(5deg); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes matchGlow {
          0%, 100% { box-shadow: 0 0 20px var(--indigo-5); }
          50% { box-shadow: 0 0 40px var(--indigo-9); }
        }
      `}</style>
    </Flex>
  );
}