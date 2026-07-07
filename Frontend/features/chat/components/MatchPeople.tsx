"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MatchedUser } from "../types";
import {
  type MatchResult,
  useMatchUiStore,
} from "../store/useMatchUiStore";
import { MatchEmptyState } from "./match/MatchEmptyState";
import { MatchFoundState } from "./match/MatchFoundState";
import { MatchIdleState } from "./match/MatchIdleState";
import { MatchSearchingState } from "./match/MatchSearchingState";
import { VipMatchEffect } from "./match/VipMatchEffect";
import { VipMatchFilters, type MatchFilters } from "./match/VipMatchFilters";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = "/api/v1/match";

type MatchPeopleProps = {
  onCancel: () => void;
  onMatched: (conversationId: string, matchedUser: MatchedUser) => void;
};

type MatchStatusResponse = {
  chatReady?: boolean;
  conversationId?: string;
  currentUserAccepted?: boolean;
  inQueue?: boolean;
  matchedUser?: MatchedUser;
  matchedWithUserId?: string;
  partnerAccepted?: boolean;
  status?: string;
};

export function MatchPeople({ onCancel, onMatched }: MatchPeopleProps) {
  const status = useMatchUiStore((state) => state.status);
  const matchResult = useMatchUiStore((state) => state.matchResult);
  const resetMatch = useMatchUiStore((state) => state.resetMatch);
  const setMatchResult = useMatchUiStore((state) => state.setMatchResult);
  const setStatus = useMatchUiStore((state) => state.setStatus);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<EventSource | null>(null);
  const completedRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const closeStream = useCallback(() => {
    streamRef.current?.close();
    streamRef.current = null;
  }, []);

  const { user } = useAuth();
  const isVip = !!user?.badge;
  const hasCompleteProfile = !!(user?.gender && user?.city);
  const [matchFilters, setMatchFilters] = useState<MatchFilters>({});
  const [error, setError] = useState<string | null>(null);

  const completeMatch = useCallback(
    (data: MatchStatusResponse) => {
      if (!data.conversationId || !data.matchedWithUserId) return;

      stopPolling();
      const matchedUser =
        data.matchedUser ??
        ({
          avatarUrl: null,
          badge: null,
          city: null,
          email: "",
          fullName: null,
          gender: null,
          id: data.matchedWithUserId,
        } satisfies MatchedUser);

      const nextResult: MatchResult = {
        chatReady: data.chatReady === true,
        conversationId: data.conversationId,
        currentUserAccepted: data.currentUserAccepted === true,
        matchedUser,
        matchedUserId: data.matchedWithUserId,
        partnerAccepted: data.partnerAccepted === true,
      };

      setStatus("matched");
      setMatchResult(nextResult);

      if (!completedRef.current) {
        completedRef.current = true;
        onMatched(nextResult.conversationId, nextResult.matchedUser);
      }
    },
    [onMatched, setMatchResult, setStatus, stopPolling],
  );

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/status`, { credentials: "include" });
      if (res.status === 401) {
        resetMatch();
        stopPolling();
        return;
      }
      if (!res.ok) return;

      const data = (await res.json()) as MatchStatusResponse;
      if (data.status === "matched") {
        completeMatch(data);
        return;
      }
      if (data.status === "cancelled" || data.status === "expired") {
        setStatus("not_found");
        stopPolling();
        return;
      }
      if (data.inQueue || data.status === "waiting") {
        setStatus("searching");
      }
    } catch (error) {
      console.error("Error checking match status:", error);
    }
  }, [completeMatch, resetMatch, setStatus, stopPolling]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(() => {
      void checkStatus();
    }, 5000);
  }, [checkStatus]);

  useEffect(() => {
    let cancelled = false;

    const restoreQueue = async () => {
      try {
        const res = await fetch(`${API_URL}/status`, { credentials: "include" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as MatchStatusResponse;
        if (data.status === "matched") {
          completeMatch(data);
          return;
        }
        if (data.inQueue || data.status === "waiting") {
          setStatus("searching");
          startPolling();
        }
      } catch (error) {
        console.error("Error restoring match status:", error);
      }
    };

    void restoreQueue();

    return () => {
      cancelled = true;
    };
  }, [completeMatch, setStatus, startPolling]);

  useEffect(() => {
    if (status !== "matched" || !matchResult || matchResult.chatReady) {
      closeStream();
      return;
    }

    closeStream();
    const source = new EventSource("/api/v1/chat/stream", {
      withCredentials: true,
    });
    streamRef.current = source;

    source.addEventListener("chat", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as {
          acceptedByUserId?: string;
          chatReady?: boolean;
          conversationId?: string;
          type?: string;
        };

        if (
          payload.type === "conversation.accepted" &&
          payload.conversationId === matchResult.conversationId
        ) {
          const nextResult: MatchResult = {
            ...matchResult,
            chatReady: payload.chatReady === true,
            partnerAccepted: true,
          };
          setMatchResult(nextResult);

          if (nextResult.chatReady && !completedRef.current) {
            completedRef.current = true;
            closeStream();
            onMatched(nextResult.conversationId, nextResult.matchedUser);
          }
        }

        if (
          payload.type === "conversation.ended" &&
          payload.conversationId === matchResult.conversationId
        ) {
          resetMatch();
          closeStream();
        }
      } catch (error) {
        console.error("Error handling match event:", error);
      }
    });

    source.onerror = closeStream;

    return closeStream;
  }, [closeStream, matchResult, onMatched, resetMatch, setMatchResult, status]);

  useEffect(() => {
    return () => {
      stopPolling();
      closeStream();
    };
  }, [closeStream, stopPolling]);

  const handleStart = async () => {
    completedRef.current = false;
    setMatchResult(null);
    setError(null);
    setStatus("searching");

    try {
      // Build filter payload if VIP
      const body: Record<string, unknown> = {};
      if (isVip && matchFilters) {
        if (matchFilters.preferredGender) body.preferredGender = matchFilters.preferredGender;
        if (matchFilters.city) body.city = matchFilters.city;
        if (matchFilters.ageMin != null) body.ageMin = matchFilters.ageMin;
        if (matchFilters.ageMax != null) body.ageMax = matchFilters.ageMax;
      }

      const res = await fetch(`${API_URL}/join`, {
        credentials: "include",
        headers: {
          ...getCsrfHeaders(),
          "Content-Type": "application/json",
        },
        method: "POST",
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Không thể tham gia tìm kiếm");
        setStatus("idle");
        return;
      }

      const data = (await res.json()) as MatchStatusResponse;
      if (data.status === "matched") {
        completeMatch(data);
        return;
      }
      startPolling();
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
      setStatus("idle");
    }
  };

  const handleStop = async () => {
    stopPolling();
    closeStream();
    await leaveQueue();
    resetMatch();
    onCancel();
  };

  const handleAccept = async () => {
    if (!matchResult) return;

    try {
      const res = await fetch(
        `/api/v1/chat/conversations/${matchResult.conversationId}/accept`,
        {
          credentials: "include",
          headers: getCsrfHeaders(),
          method: "PATCH",
        },
      );
      if (!res.ok) return;

      setMatchResult({
        ...matchResult,
        currentUserAccepted: true,
      });
      await checkStatus();
    } catch (error) {
      console.error("Error accepting match:", error);
    }
  };

  const handleDecline = async () => {
    if (matchResult) {
      await fetch(`/api/v1/chat/conversations/${matchResult.conversationId}/end`, {
        credentials: "include",
        headers: getCsrfHeaders(),
        method: "PATCH",
      }).catch(() => undefined);
    }
    await handleStop();
  };

  return (
    <Box className={hasCompleteProfile ? "match-scroll-panel" : ""} style={!hasCompleteProfile ? { flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" } : undefined}>
      <VipMatchEffect show={status === "matched" && isVip} />
      <Flex
        align="center"
        justify="center"
        style={{
          minHeight: "100%",
          padding: "28px 16px 40px",
          width: "100%",
        }}
      >
        {status === "idle" && (
          <Flex direction="column" gap="4" style={{ width: "100%", maxWidth: 400 }}>
            {isVip && (
              <VipMatchFilters
                filters={matchFilters}
                onChange={setMatchFilters}
              />
            )}
            {error && (
              <Box
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 12,
                  padding: "12px 16px",
                }}
              >
                <Flex align="center" gap="3">
                  <Box style={{ color: "var(--chat-danger)", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </Box>
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Text size="2" weight="medium" style={{ color: "var(--chat-text)" }}>
                      {error}
                    </Text>
                    {error.includes("cập nhật") && (
                      <Text
                        size="2"
                        style={{
                          color: "var(--primary)",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => {
                          // Will be handled by parent
                        }}
                      >
                        Cập nhật hồ sơ ngay
                      </Text>
                    )}
                  </Flex>
                </Flex>
              </Box>
            )}
            <MatchIdleState
              onStart={handleStart}
              user={user}
              hasCompleteProfile={!!(user?.gender && user?.city)}
            />
          </Flex>
        )}
        {status === "searching" && <MatchSearchingState onStop={handleStop} />}
        {status === "not_found" && <MatchEmptyState onRetry={resetMatch} />}
        {status === "matched" && matchResult && (
          <MatchFoundState
            matchResult={matchResult}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        )}
      </Flex>
    </Box>
  );
}

async function leaveQueue() {
  await fetch(`${API_URL}/leave`, {
    credentials: "include",
    headers: getCsrfHeaders(),
    method: "DELETE",
  }).catch(() => undefined);
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
