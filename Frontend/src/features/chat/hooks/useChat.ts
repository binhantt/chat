"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getStoredProfile } from "@/features/profile/types";
import type { ChatMessage, ChannelMsg } from "../types";

const BOT_LINES = [
  "Xin chào! 👋 Bạn khoẻ không?",
  "Bạn sống ở đâu vậy?",
  "Thú vị thật đó 😊",
  "Mình cũng mới dùng app này lần đầu",
  "Có nhiều người dùng không bạn?",
  "Bạn thường hay làm gì vào cuối tuần?",
];

export function useChat(roomId: string) {
  const router = useRouter();
  const profile = getStoredProfile();
  const myId = profile?.userId ?? "me";
  const isBot = roomId.includes("bot");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [iLiked, setILiked] = useState(false);
  const [partnerLiked, setPartnerLiked] = useState(false);
  const [partnerLeft, setPartnerLeft] = useState(false);
  const [mutualLike, setMutualLike] = useState(false);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const botIdx = useRef(0);
  const botTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const scheduleBotMsg = useCallback(() => {
    if (botIdx.current >= BOT_LINES.length) return;
    const delay = 1500 + Math.random() * 2000;
    botTimer.current = setTimeout(() => {
      addMessage({
        id: `bot-${Date.now()}`,
        content: BOT_LINES[botIdx.current++],
        senderId: "partner",
        messageType: "text",
        timestamp: Date.now(),
        isOwn: false,
      });
      scheduleBotMsg();
    }, delay);
  }, [addMessage]);

  useEffect(() => {
    const ch = new BroadcastChannel(`chat-room-${roomId}`);
    channelRef.current = ch;

    ch.postMessage({ type: "ready", senderId: myId } satisfies ChannelMsg);

    ch.onmessage = (e: MessageEvent<ChannelMsg>) => {
      const msg = e.data;
      if (msg.senderId === myId) return;
      if (msg.type === "message" && msg.id && msg.content) {
        addMessage({ id: msg.id, content: msg.content, senderId: msg.senderId, messageType: msg.messageType ?? "text", timestamp: msg.timestamp ?? Date.now(), isOwn: false });
      }
      if (msg.type === "like") setPartnerLiked(true);
      if (msg.type === "unlike") setPartnerLiked(false);
      if (msg.type === "exit") setPartnerLeft(true);
    };

    if (isBot) scheduleBotMsg();

    return () => {
      ch.close();
      if (botTimer.current) clearTimeout(botTimer.current);
    };
  }, [roomId, myId, isBot, scheduleBotMsg, addMessage]);

  useEffect(() => {
    if (iLiked && partnerLiked) setMutualLike(true);
  }, [iLiked, partnerLiked]);

  const sendMessage = useCallback(
    (content: string, messageType: "text" | "emoji" | "image" = "text") => {
      const msg: ChatMessage = { id: `${myId}-${Date.now()}`, content, senderId: myId, messageType, timestamp: Date.now(), isOwn: true };
      addMessage(msg);
      channelRef.current?.postMessage({ type: "message", senderId: myId, id: msg.id, content, messageType, timestamp: msg.timestamp } satisfies ChannelMsg);
    },
    [myId, addMessage]
  );

  const toggleLike = useCallback(() => {
    const next = !iLiked;
    setILiked(next);
    channelRef.current?.postMessage({ type: next ? "like" : "unlike", senderId: myId } satisfies ChannelMsg);
    if (isBot && next && !partnerLiked) {
      setTimeout(() => setPartnerLiked(true), 1200 + Math.random() * 1500);
    }
  }, [iLiked, myId, isBot, partnerLiked]);

  const exitChat = useCallback(() => {
    channelRef.current?.postMessage({ type: "exit", senderId: myId } satisfies ChannelMsg);
    channelRef.current?.close();
    router.replace("/find");
  }, [myId, router]);

  return { messages, iLiked, partnerLiked, mutualLike, partnerLeft, myProfile: profile, sendMessage, toggleLike, exitChat };
}
