"use client";

import { Box, Flex } from "@radix-ui/themes";
import { useCallback, useEffect, useRef } from "react";
import type { MatchedUser } from "../types";
import {
  type MatchResult,
  useMatchUiStore,
} from "../store/useMatchUiStore";
import { MatchEmptyState } from "./match/MatchEmptyState";
import { MatchFoundState } from "./match/MatchFoundState";
import { MatchIdleState } from "./match/MatchIdleState";
import { MatchSearchingState } from "./match/MatchSearchingState";

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

  const completeMatch = useCallback(
    (data: MatchStatusResponse) => {
      if (!data.conversationId || !data.matchedWithUserId) return;

      stopPolling();
      const matchedUser =
        data.matchedUser ??
        ({
          avatarUrl: null,
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
    setStatus("searching");

    try {
      const res = await fetch(`${API_URL}/join`, {
        credentials: "include",
        headers: getCsrfHeaders(),
        method: "POST",
      });
      if (!res.ok) {
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
    <Box className="match-scroll-panel">
      <Flex
        align="center"
        justify="center"
        style={{
          minHeight: "100%",
          padding: "28px 16px 40px",
          width: "100%",
        }}
      >
        {status === "idle" && <MatchIdleState onStart={handleStart} />}
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
