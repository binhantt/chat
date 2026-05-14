"use client";

import { Badge, Box, Button, Flex, Text } from "@radix-ui/themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const API_URL = "/api/v1/match";

export enum MatchStatus {
  Idle = "idle",
  Searching = "searching",
  Matched = "matched",
  NotFound = "not_found",
}

interface MatchResult {
  conversationId: string;
  matchedUserId: string;
  currentUserAccepted?: boolean;
  partnerAccepted?: boolean;
  chatReady?: boolean;
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
  onMatched: (
    conversationId: string,
    matchedUser: MatchResult["matchedUser"],
  ) => void;
  onCancel: () => void;
}

export function MatchPeople({ onMatched, onCancel }: MatchPeopleProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const textPrimary = isDark ? "#e2e8f0" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const greenColor = "#16a34a";
  const borderColor = isDark
    ? "rgba(255,255,255,0.12)"
    : "rgba(99,102,241,0.14)";

  const [status, setStatus] = useState<MatchStatus>(MatchStatus.Idle);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const matchEventSourceRef = useRef<EventSource | null>(null);
  const completedMatchRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const completeMatch = useCallback(
    (data: {
      conversationId: string;
      matchedWithUserId: string;
      matchedUser?: MatchResult["matchedUser"];
      currentUserAccepted?: boolean;
      partnerAccepted?: boolean;
      chatReady?: boolean;
    }) => {
      stopPolling();

      const matchedUser = data.matchedUser || {
        id: data.matchedWithUserId,
        email: "",
        fullName: null,
        avatarUrl: null,
        gender: null,
        city: null,
      };

      setStatus(MatchStatus.Matched);
      setMatchResult({
        conversationId: data.conversationId,
        matchedUserId: data.matchedWithUserId,
        currentUserAccepted: data.currentUserAccepted === true,
        partnerAccepted: data.partnerAccepted === true,
        chatReady: data.chatReady === true,
        matchedUser,
      });

      if (!completedMatchRef.current) {
        completedMatchRef.current = true;
        onMatched(data.conversationId, matchedUser);
      }
    },
    [onMatched, stopPolling],
  );

  const checkMatchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/status`, { credentials: "include" });
      if (res.status === 401) {
        stopPolling();
        setStatus(MatchStatus.Idle);
        return;
      }
      if (!res.ok) return;

      const data = await res.json();

      if (
        data.status === "matched" &&
        data.conversationId &&
        data.matchedWithUserId
      ) {
        completeMatch(data);
      } else if (data.status === "cancelled" || data.status === "expired") {
        setStatus(MatchStatus.NotFound);
        stopPolling();
      } else if (data.inQueue || data.status === "waiting") {
        setStatus(MatchStatus.Searching);
      }
    } catch (error) {
      console.error("Error checking match status:", error);
    }
  }, [completeMatch, stopPolling]);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    pollingIntervalRef.current = setInterval(checkMatchStatus, 5000);
  }, [checkMatchStatus]);

  useEffect(() => {
    let cancelled = false;

    const restoreActiveQueue = async () => {
      try {
        const res = await fetch(`${API_URL}/status`, {
          credentials: "include",
        });
        if (res.status === 401) {
          stopPolling();
          setStatus(MatchStatus.Idle);
          return;
        }
        if (!res.ok || cancelled) return;

        const data = await res.json();
        if (
          data.status === "matched" &&
          data.conversationId &&
          data.matchedWithUserId
        ) {
          completeMatch(data);
          return;
        }

        if (data.inQueue || data.status === "waiting") {
          setStatus(MatchStatus.Searching);
          startPolling();
        }
      } catch (error) {
        console.error("Error restoring match status:", error);
      }
    };

    void restoreActiveQueue();

    return () => {
      cancelled = true;
    };
  }, [completeMatch, startPolling]);

  const handleStartSearch = async () => {
    completedMatchRef.current = false;
    setMatchResult(null);
    setStatus(MatchStatus.Searching);

    try {
      const res = await fetch(`${API_URL}/join`, {
        method: "POST",
        credentials: "include",
        headers: getCsrfHeaders(),
      });

      if (!res.ok) {
        setStatus(MatchStatus.Idle);
        return;
      }

      const data = await res.json();
      if (
        data.status === "matched" &&
        data.conversationId &&
        data.matchedWithUserId
      ) {
        completeMatch(data);
        return;
      }

      startPolling();
    } catch {
      setStatus(MatchStatus.Idle);
    }
  };

  const handleStopSearch = async () => {
    stopPolling();

    try {
      await fetch(`${API_URL}/leave`, {
        method: "DELETE",
        credentials: "include",
        headers: getCsrfHeaders(),
      });
    } catch (error) {
      console.error("Error leaving queue:", error);
    }

    setStatus(MatchStatus.Idle);
  };

  const clearCurrentMatch = useCallback(
    async (conversationId?: string) => {
      stopPolling();
      matchEventSourceRef.current?.close();
      matchEventSourceRef.current = null;

      if (conversationId) {
        try {
          await fetch(`/api/v1/chat/conversations/${conversationId}/end`, {
            method: "PATCH",
            credentials: "include",
            headers: getCsrfHeaders(),
          });
        } catch (error) {
          console.error("Error ending stale match:", error);
        }
      }

      try {
        await fetch(`${API_URL}/leave`, {
          method: "DELETE",
          credentials: "include",
          headers: getCsrfHeaders(),
        });
      } catch (error) {
        console.error("Error leaving stale match queue:", error);
      }

      completedMatchRef.current = false;
      setMatchResult(null);
      setStatus(MatchStatus.Idle);
    },
    [stopPolling],
  );

  const resetMatchView = useCallback(() => {
    stopPolling();
    matchEventSourceRef.current?.close();
    matchEventSourceRef.current = null;
    completedMatchRef.current = false;
    setMatchResult(null);
    setStatus(MatchStatus.Idle);
  }, [stopPolling]);

  const handleAcceptMatch = async () => {
    if (!matchResult) return;

    try {
      const res = await fetch(
        `/api/v1/chat/conversations/${matchResult.conversationId}/accept`,
        {
          method: "PATCH",
          credentials: "include",
          headers: getCsrfHeaders(),
        },
      );

      if (res.status === 401) {
        resetMatchView();
        return;
      }

      if (res.status === 403 || res.status === 404) {
        const data = await res.json().catch(() => ({}));
        console.warn("Accept match rejected:", data);
        if (isCsrfError(data)) {
          return;
        }
        resetMatchView();
        return;
      }

      if (!res.ok) return;

      setMatchResult((current) =>
        current
          ? {
              ...current,
              currentUserAccepted: true,
            }
          : current,
      );
      await checkMatchStatus();
    } catch (error) {
      console.error("Error accepting match:", error);
    }
  };

  const handleDeclineMatch = async () => {
    if (!matchResult) return;

    await clearCurrentMatch(matchResult.conversationId);
  };

  useEffect(() => {
    if (status !== MatchStatus.Matched || !matchResult || matchResult.chatReady) {
      matchEventSourceRef.current?.close();
      matchEventSourceRef.current = null;
      return;
    }

    matchEventSourceRef.current?.close();
    const source = new EventSource("/api/v1/chat/stream", {
      withCredentials: true,
    });
    matchEventSourceRef.current = source;

    source.addEventListener("chat", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data);

        if (
          payload?.type === "conversation.accepted" &&
          payload.conversationId === matchResult.conversationId
        ) {
          setMatchResult((current) =>
            current
              ? {
                  ...current,
                  partnerAccepted:
                    payload.acceptedByUserId !== user?.id
                      ? true
                      : current.partnerAccepted,
                  currentUserAccepted:
                    payload.acceptedByUserId === user?.id
                      ? true
                      : current.currentUserAccepted,
                  chatReady: payload.chatReady === true,
                }
              : current,
          );

          if (payload.chatReady === true && !completedMatchRef.current) {
            completedMatchRef.current = true;
            source.close();
            matchEventSourceRef.current = null;
            onMatched(matchResult.conversationId, matchResult.matchedUser);
          }
          return;
        }

        if (
          payload?.type === "conversation.ended" &&
          payload.conversationId === matchResult.conversationId
        ) {
          source.close();
          matchEventSourceRef.current = null;
          completedMatchRef.current = false;
          setMatchResult(null);
          setStatus(MatchStatus.Idle);
        }
      } catch (error) {
        console.error("Error handling match event:", error);
      }
    });

    source.onerror = () => {
      source.close();
      if (matchEventSourceRef.current === source) {
        matchEventSourceRef.current = null;
      }
    };

    return () => {
      source.close();
      if (matchEventSourceRef.current === source) {
        matchEventSourceRef.current = null;
      }
    };
  }, [matchResult, onMatched, status, user?.id]);

  useEffect(() => {
    return () => {
      stopPolling();
      matchEventSourceRef.current?.close();
      matchEventSourceRef.current = null;
    };
  }, [stopPolling]);

  const getUserInitials = (name: string | null | undefined, email: string) => {
    if (!name) return email.slice(0, 2).toUpperCase();
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getSearchText = () => {
    if (user?.gender === "male") return "Tìm kiếm nữ cùng thành phố";
    if (user?.gender === "female") return "Tìm kiếm nam cùng thành phố";
    return "Cập nhật giới tính để tìm người phù hợp";
  };

  const canMatch = !!user?.gender && !!user?.city;

  return (
    <Box
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        borderRadius: 8,
      }}
    >
      <Decorations isDark={isDark} />

      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          minHeight: "100%",
          padding: "18px 16px 24px",
        }}
      >
        <Box
          style={{
            width: "min(100%, 460px)",
            border: `1px solid ${borderColor}`,
            borderRadius: 8,
            background: isDark
              ? "rgba(15,23,42,0.86)"
              : "rgba(255,255,255,0.92)",
            boxShadow: isDark
              ? "0 24px 60px rgba(0,0,0,0.28)"
              : "0 24px 60px rgba(79,70,229,0.13)",
            backdropFilter: "blur(16px)",
            padding: "22px 22px 20px",
          }}
        >
          {status === MatchStatus.Idle && (
            <Flex direction="column" align="center" gap="4">
              <StatusBadge label="Sẵn sàng ghép đôi" color="green" />
              <SignalOrb mode="idle" />
              <Flex
                direction="column"
                align="center"
                gap="2"
                style={{ textAlign: "center" }}
              >
                <Text size="6" weight="bold" style={{ color: textPrimary }}>
                  Tìm người trò chuyện
                </Text>
                <Text size="3" style={{ color: textSecondary }}>
                  {getSearchText()}
                </Text>
              </Flex>

              {!canMatch && (
                <Box
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    background: "rgba(245,158,11,0.12)",
                    padding: "10px 12px",
                    textAlign: "center",
                  }}
                >
                  <Text size="2" style={{ color: "#b45309", lineHeight: 1.5 }}>
                    Vui lòng cập nhật giới tính và thành phố trong phần giới
                    thiệu trước.
                  </Text>
                </Box>
              )}

              <Button
                size="3"
                onClick={handleStartSearch}
                disabled={!canMatch}
                style={{
                  width: "100%",
                  maxWidth: 240,
                  height: 46,
                  fontWeight: 700,
                  borderRadius: 8,
                  background: canMatch
                    ? `linear-gradient(135deg, ${greenColor}, #10b981)`
                    : isDark
                      ? "#374151"
                      : "#cbd5e1",
                  color: "white",
                  border: "none",
                }}
              >
                Bắt đầu tìm kiếm
              </Button>
            </Flex>
          )}

          {status === MatchStatus.Searching && (
            <Flex direction="column" align="center" gap="4">
              <StatusBadge label="Ghép đôi ngẫu nhiên" color="indigo" />
              <SignalOrb mode="searching" />
              <Flex
                direction="column"
                align="center"
                gap="2"
                style={{ textAlign: "center" }}
              >
                <Text size="6" weight="bold" style={{ color: textPrimary }}>
                  Đang tìm người phù hợp
                </Text>
                <Text
                  size="3"
                  style={{
                    color: textSecondary,
                    lineHeight: 1.55,
                    maxWidth: 340,
                  }}
                >
                  Hệ thống đang ưu tiên người cùng thành phố và phù hợp với hồ
                  sơ của bạn.
                </Text>
              </Flex>

              <Flex gap="2" wrap="wrap" justify="center">
                <Badge color="green" variant="soft">
                  Online
                </Badge>
                <Badge color="violet" variant="soft">
                  Cùng thành phố
                </Badge>
                <Badge color="gray" variant="soft">
                  Tự làm mới
                </Badge>
              </Flex>

              <ProgressLine isDark={isDark} />

              <Button
                variant="soft"
                size="3"
                onClick={handleStopSearch}
                style={{
                  width: "100%",
                  maxWidth: 280,
                  minWidth: 180,
                  height: 44,
                  fontWeight: 700,
                  borderRadius: 8,
                  color: textSecondary,
                  flexShrink: 0,
                }}
              >
                Hủy tìm kiếm
              </Button>
            </Flex>
          )}

          {status === MatchStatus.NotFound && (
            <Flex direction="column" align="center" gap="4">
              <StatusBadge label="Chưa có kết quả" color="amber" />
              <SignalOrb mode="empty" />
              <Flex
                direction="column"
                align="center"
                gap="2"
                style={{ textAlign: "center" }}
              >
                <Text size="6" weight="bold" style={{ color: textPrimary }}>
                  Chưa tìm thấy ai
                </Text>
                <Text
                  size="3"
                  style={{ color: textSecondary, lineHeight: 1.55 }}
                >
                  Hiện chưa có người phù hợp đang online. Bạn có thể thử lại sau
                  ít phút.
                </Text>
              </Flex>
              <Button
                variant="soft"
                size="3"
                onClick={() => setStatus(MatchStatus.Idle)}
                style={{
                  minWidth: 160,
                  height: 44,
                  fontWeight: 700,
                  borderRadius: 8,
                }}
              >
                Thử lại
              </Button>
            </Flex>
          )}

          {status === MatchStatus.Matched && matchResult && (
            <Flex direction="column" align="center" gap="4">
              <StatusBadge label="Đã ghép đôi" color="green" />
              <Box
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${greenColor}, #10b981)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 30,
                  fontWeight: 800,
                  boxShadow: "0 18px 36px rgba(16,185,129,0.25)",
                }}
              >
                ??
              </Box>

              <Flex
                direction="column"
                align="center"
                gap="1"
                style={{ textAlign: "center" }}
              >
                <Text size="6" weight="bold" style={{ color: greenColor }}>
                  Đã tìm thấy!
                </Text>
                <Text size="4" weight="medium" style={{ color: textPrimary }}>
                  {matchResult.chatReady
                    ? matchResult.matchedUser.fullName ||
                      matchResult.matchedUser.email
                    : "Nguoi an danh"}
                </Text>
                {matchResult.matchedUser.city && (
                  <Text size="2" style={{ color: textSecondary }}>
                    Dia diem: {matchResult.matchedUser.city}
                  </Text>
                )}
                {!matchResult.chatReady && (
                  <Text size="2" style={{ color: textSecondary }}>
                    {matchResult.currentUserAccepted
                      ? "Ban da thich. Dang cho nguoi kia xac nhan."
                      : "Chi hien ten khi ca hai cung thich."}
                  </Text>
                )}
              </Flex>

              <Flex gap="3" wrap="wrap" justify="center">
                <Button
                  variant="soft"
                  size="3"
                  onClick={handleDeclineMatch}
                  style={{
                    minWidth: 120,
                    height: 44,
                    fontWeight: 700,
                    borderRadius: 8,
                  }}
                >
                  Bỏ qua
                </Button>
                <Button
                  size="3"
                  onClick={handleAcceptMatch}
                  disabled={matchResult.currentUserAccepted === true}
                  style={{
                    minWidth: 180,
                    height: 44,
                    fontWeight: 700,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${greenColor}, #10b981)`,
                    color: "white",
                    border: "none",
                  }}
                >
                  {matchResult.currentUserAccepted
                    ? "Dang cho xac nhan"
                    : "Thich"}
                </Button>
              </Flex>
            </Flex>
          )}
        </Box>
      </Flex>

      <style>{`
        @keyframes radarPing {
          0% { transform: scale(0.72); opacity: 0.75; }
          80%, 100% { transform: scale(1.22); opacity: 0; }
        }
        @keyframes floatSoft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes searchProgress {
          0% { transform: translateX(-110%); }
          50% { transform: translateX(80%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </Box>
  );
}

function StatusBadge({
  label,
  color,
}: {
  label: string;
  color: "green" | "indigo" | "amber";
}) {
  return (
    <Badge color={color} variant="soft" style={{ fontWeight: 700 }}>
      {label}
    </Badge>
  );
}

function SignalOrb({ mode }: { mode: "idle" | "searching" | "empty" }) {
  const active = mode === "searching";
  const muted = mode === "empty";

  return (
    <Box
      style={{
        position: "relative",
        width: 124,
        height: 124,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: muted
          ? "rgba(148,163,184,0.14)"
          : "radial-gradient(circle, rgba(99,102,241,0.23) 0%, rgba(99,102,241,0.08) 58%, transparent 62%)",
        animation: "floatSoft 3.4s ease-in-out infinite",
      }}
    >
      {active && (
        <>
          <Box
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1px solid rgba(99,102,241,0.25)",
              animation: "radarPing 2.2s ease-out infinite",
            }}
          />
          <Box
            style={{
              position: "absolute",
              inset: 22,
              borderRadius: "50%",
              border: "1px solid rgba(99,102,241,0.30)",
              animation: "radarPing 2.2s ease-out infinite 0.45s",
            }}
          />
        </>
      )}

      <Box
        style={{
          width: 78,
          height: 78,
          borderRadius: "50%",
          background: muted
            ? "linear-gradient(135deg, #94a3b8, #64748b)"
            : "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: muted
            ? "0 16px 30px rgba(100,116,139,0.22)"
            : "0 18px 34px rgba(99,102,241,0.32)",
        }}
      >
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {muted ? (
            <>
              <circle cx="12" cy="12" r="8" />
              <path d="M9 9l6 6" />
              <path d="M15 9l-6 6" />
            </>
          ) : (
            <>
              <path d="M17 8a5 5 0 0 0-10 0" />
              <path d="M3 14a9 9 0 0 1 18 0" />
              <path d="M7 14a5 5 0 0 1 10 0" />
              <path d="M12 14v4" />
              <circle cx="12" cy="20" r="1" fill="white" />
            </>
          )}
        </svg>
      </Box>
    </Box>
  );
}

function ProgressLine({ isDark }: { isDark: boolean }) {
  return (
    <Box
      style={{
        width: "100%",
        height: 6,
        borderRadius: 999,
        overflow: "hidden",
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
      }}
    >
      <Box
        style={{
          width: "42%",
          height: "100%",
          borderRadius: 999,
          background: "linear-gradient(90deg, #6366f1, #22c55e)",
          animation: "searchProgress 1.6s ease-in-out infinite",
        }}
      />
    </Box>
  );
}

function isCsrfError(data: unknown): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    String(data.message).toLowerCase().includes("csrf")
  );
}

function getCsrfHeaders(): HeadersInit {
  const csrfToken = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("csrf_token="))
    ?.split("=")
    .slice(1)
    .join("=");

  return csrfToken
    ? {
        "X-CSRF-Token": decodeURIComponent(csrfToken),
      }
    : {};
}

function Decorations({ isDark }: { isDark: boolean }) {
  const soft = isDark ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.12)";
  const green = isDark ? "rgba(34,197,94,0.16)" : "rgba(34,197,94,0.12)";

  return (
    <>
      <Box
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          left: "8%",
          top: "10%",
          background: soft,
          filter: "blur(28px)",
        }}
      />
      <Box
        style={{
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: "50%",
          right: "10%",
          bottom: "8%",
          background: green,
          filter: "blur(26px)",
        }}
      />
      <Box
        style={{
          position: "absolute",
          inset: "12px",
          borderRadius: 8,
          border: isDark
            ? "1px dashed rgba(255,255,255,0.08)"
            : "1px dashed rgba(99,102,241,0.16)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
