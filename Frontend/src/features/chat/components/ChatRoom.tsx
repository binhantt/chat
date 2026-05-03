"use client";

import { useRef, useEffect, useState } from "react";
import { Flex, Text, Button, Separator, Badge } from "@radix-ui/themes";
import { HeartIcon, HeartFilledIcon, ExitIcon, ImageIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { useChat } from "../hooks/useChat";
import type { ChatMessage } from "../types";

const EMOJIS = ["😀","😂","😍","🥰","😎","😢","😡","🤔","😴","👍","👎","❤️","🔥","💯","🎉","🙏","💪","👋","🌟","✨","😊","🫡","🥲","😤"];

function Bubble({ msg }: { msg: ChatMessage }) {
  const isImg = msg.messageType === "image";
  return (
    <div style={{ display: "flex", justifyContent: msg.isOwn ? "flex-end" : "flex-start", marginBottom: 8, alignItems: "flex-end", gap: 8 }}>
      {!msg.isOwn && (
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🎭</div>
      )}
      <div style={{ maxWidth: "66%", padding: isImg ? 4 : "10px 14px", borderRadius: msg.isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.isOwn ? "linear-gradient(135deg,#0891b2,#0284c7)" : "rgba(255,255,255,0.1)", color: msg.isOwn ? "white" : "#e2e8f0", fontSize: 14, lineHeight: 1.55, wordBreak: "break-word", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
        {isImg ? <img src={msg.content} alt="img" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 10, display: "block" }} /> : msg.content}
        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.55, textAlign: msg.isOwn ? "right" : "left" }}>
          {new Date(msg.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

export function ChatRoom({ roomId }: { roomId: string }) {
  const { messages, iLiked, partnerLiked, mutualLike, partnerLeft, myProfile, sendMessage, toggleLike, exitChat } = useChat(roomId);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function submit() {
    const t = text.trim();
    if (!t) return;
    sendMessage(t, "text");
    setText("");
    setShowEmoji(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const src = ev.target?.result as string; if (src) sendMessage(src, "image"); };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "linear-gradient(180deg,#0f172a 0%,#1e293b 100%)", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ padding: "12px 20px", background: "rgba(15,23,42,0.96)", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#334155,#475569)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎭</div>
        <div style={{ flex: 1 }}>
          <Text size="3" weight="bold" style={{ color: "#f1f5f9", display: "block" }}>
            {mutualLike ? "Người Lạ (đã ghép đôi 💞)" : "Người Lạ"}
          </Text>
          <Flex align="center" gap="2">
            <Badge color={partnerLeft ? "gray" : "green"} variant="soft" size="1">
              {partnerLeft ? "Đã rời phòng" : "Đang online"}
            </Badge>
            {partnerLiked && !mutualLike && <Badge color="pink" variant="soft" size="1">❤️ Thích bạn</Badge>}
          </Flex>
        </div>

        <Button variant="ghost" color={iLiked ? "pink" : "gray"} size="2" onClick={toggleLike} style={{ cursor: "pointer" }}>
          {iLiked ? <HeartFilledIcon width={18} height={18} /> : <HeartIcon width={18} height={18} />}
        </Button>

        <Button variant="ghost" color="gray" size="2" onClick={exitChat} style={{ cursor: "pointer" }}>
          <ExitIcon width={16} height={16} />
        </Button>
      </div>

      {/* Mutual like banner */}
      {mutualLike && (
        <div style={{ padding: "8px 20px", background: "rgba(244,63,94,0.1)", borderBottom: "1px solid rgba(244,63,94,0.15)", flexShrink: 0 }}>
          <Text size="2" style={{ color: "#fda4af" }}>
            💞 Cả 2 đã thích nhau! Tên của {myProfile?.name ?? "bạn"} đã hiển thị với đối phương.
          </Text>
        </div>
      )}

      {/* Partner left */}
      {partnerLeft && (
        <div style={{ padding: "8px 20px", background: "rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <Text size="2" style={{ color: "#fca5a5" }}>Người kia đã rời phòng. Cuộc trò chuyện kết thúc.</Text>
          <Button size="1" color="red" variant="soft" onClick={exitChat} style={{ cursor: "pointer" }}>Thoát</Button>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {messages.length === 0 && (
          <Flex direction="column" align="center" justify="center" style={{ height: "100%", opacity: 0.35 }} gap="2">
            <Text size="7">💬</Text>
            <Text size="2" color="gray">Hãy gửi tin nhắn đầu tiên!</Text>
          </Flex>
        )}
        {messages.map((m) => <Bubble key={m.id} msg={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div style={{ background: "rgba(15,23,42,0.98)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: 10, display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 2, flexShrink: 0 }}>
          {EMOJIS.map((em) => (
            <button key={em} onClick={() => { sendMessage(em, "emoji"); setShowEmoji(false); }} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", padding: 6, borderRadius: 6 }}>
              {em}
            </button>
          ))}
        </div>
      )}

      <Separator size="4" style={{ flexShrink: 0, opacity: 0.1 }} />

      {/* Input */}
      <div style={{ padding: "10px 14px", background: "rgba(15,23,42,0.96)", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
        <Button variant="ghost" color={showEmoji ? "cyan" : "gray"} size="2" onClick={() => setShowEmoji((v) => !v)} style={{ cursor: "pointer", fontSize: 18, padding: "6px 10px" }}>😊</Button>
        <Button variant="ghost" color="gray" size="2" onClick={() => fileRef.current?.click()} style={{ cursor: "pointer" }}>
          <ImageIcon width={16} height={16} />
        </Button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onImage} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder={partnerLeft ? "Cuộc trò chuyện đã kết thúc" : "Nhập tin nhắn… (Enter để gửi)"}
          disabled={partnerLeft}
          rows={1}
          style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "9px 14px", color: "#e2e8f0", fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", maxHeight: 100 }}
        />
        <Button size="2" disabled={!text.trim() || partnerLeft} onClick={submit} style={{ cursor: text.trim() && !partnerLeft ? "pointer" : "not-allowed", flexShrink: 0 }}>
          <PaperPlaneIcon width={14} height={14} />
        </Button>
      </div>
    </div>
  );
}
