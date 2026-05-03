"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getStoredProfile } from "@/features/profile/types";
import type { QueueMsg } from "@/features/chat/types";

export type QueueState = "idle" | "searching" | "matched";

export function useQueue() {
  const router = useRouter();
  const [state, setState] = useState<QueueState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [position, setPosition] = useState(1);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const myIdRef = useRef("");

  const cleanup = useCallback(() => {
    channelRef.current?.close();
    channelRef.current = null;
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    if (posTimerRef.current) clearInterval(posTimerRef.current);
  }, []);

  const goToChat = useCallback(
    (roomId: string) => {
      cleanup();
      setState("matched");
      router.replace(`/chat?room=${roomId}`);
    },
    [cleanup, router]
  );

  const startSearch = useCallback(() => {
    const profile = getStoredProfile();
    if (!profile) {
      router.replace("/profile-setup");
      return;
    }
    myIdRef.current = profile.userId;
    setState("searching");
    setElapsed(0);
    setPosition(Math.floor(Math.random() * 5) + 1);

    const ch = new BroadcastChannel("chat-queue");
    channelRef.current = ch;

    ch.onmessage = (e: MessageEvent<QueueMsg>) => {
      const msg = e.data;
      if (msg.type === "join" && msg.userId !== myIdRef.current) {
        // I'm the first — I create the room and match
        const roomId = `room-${Date.now()}`;
        ch.postMessage({ type: "match", userId: myIdRef.current, roomId, partnerId: msg.userId } satisfies QueueMsg);
        goToChat(roomId);
      }
      if (msg.type === "match" && msg.partnerId === myIdRef.current && msg.roomId) {
        goToChat(msg.roomId);
      }
    };

    ch.postMessage({ type: "join", userId: myIdRef.current } satisfies QueueMsg);

    elapsedRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    posTimerRef.current = setInterval(() => {
      setPosition((p) => Math.max(1, p + (Math.random() > 0.5 ? -1 : 1)));
    }, 2500);

    // Bot fallback after 7 s
    botTimerRef.current = setTimeout(() => {
      goToChat(`room-bot-${Date.now()}`);
    }, 7000);
  }, [router, goToChat]);

  const cancelSearch = useCallback(() => {
    channelRef.current?.postMessage({ type: "leave", userId: myIdRef.current } satisfies QueueMsg);
    cleanup();
    setState("idle");
    setElapsed(0);
  }, [cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  return { state, elapsed, position, startSearch, cancelSearch };
}
