"use client";

import { Flex, Text, Button, Badge, Separator } from "@radix-ui/themes";
import { MagnifyingGlassIcon, Cross2Icon, ChatBubbleIcon } from "@radix-ui/react-icons";
import { useQueue } from "../hooks/useQueue";

function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

export function FindPage() {
  const { state, elapsed, position, startSearch, cancelSearch } = useQueue();
  const searching = state === "searching";

  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 32, background: "linear-gradient(135deg,#f0f9ff 0%,#f8fafc 100%)" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <Flex direction="column" align="center" gap="4" style={{ marginBottom: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg,#0891b2,#0284c7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 32px rgba(8,145,178,0.35)${searching ? ",0 0 0 8px rgba(8,145,178,0.15),0 0 0 16px rgba(8,145,178,0.08)" : ""}`, transition: "box-shadow 0.4s ease" }}>
            <ChatBubbleIcon width={36} height={36} color="white" />
          </div>
          <Flex direction="column" align="center" gap="1">
            <Text size="7" weight="bold" style={{ color: "#0f172a", letterSpacing: "-0.03em" }}>Chat vs Người Lạ 2</Text>
            <Text size="2" color="gray">Kết nối ngẫu nhiên · Hoàn toàn ẩn danh</Text>
          </Flex>
        </Flex>

        {/* Card */}
        <div style={{ background: "white", borderRadius: 20, padding: 36, boxShadow: "0 4px 24px rgba(15,23,42,0.08)", border: "1px solid #e2e8f0" }}>
          {!searching ? (
            <Flex direction="column" gap="5">
              <Flex direction="column" gap="1">
                <Text size="5" weight="bold" style={{ color: "#0f172a" }}>Tìm người lạ</Text>
                <Text size="2" color="gray">Ghép đôi ngẫu nhiên với người dùng đang trực tuyến</Text>
              </Flex>

              <Flex gap="3">
                {[["Toàn cầu", "cyan"], ["Tức thì", "blue"], ["Ẩn danh", "indigo"]] .map(([label, color]) => (
                  <Badge key={label} color={color as "cyan"} variant="soft" size="2">{label}</Badge>
                ))}
              </Flex>

              <Separator size="4" />

              <Button id="find-btn" size="4" onClick={startSearch} style={{ height: 52, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(8,145,178,0.3)" }}>
                <MagnifyingGlassIcon width={18} height={18} />
                Tìm Người Lạ
              </Button>
            </Flex>
          ) : (
            <Flex direction="column" align="center" gap="5">
              {/* Ripple animation */}
              <div style={{ position: "relative", width: 88, height: 88, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(8,145,178,0.35)", animation: `ripple 2s ease-out ${i * 0.65}s infinite` }} />
                ))}
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#0891b2,#0284c7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MagnifyingGlassIcon width={22} height={22} color="white" />
                </div>
              </div>

              <Flex direction="column" align="center" gap="2">
                <Text size="5" weight="bold" style={{ color: "#0f172a" }}>Đang tìm kiếm…</Text>
                <Flex gap="4">
                  <Badge color="cyan" variant="soft" size="2">⏱ {fmt(elapsed)}</Badge>
                  <Badge color="blue" variant="soft" size="2">Hàng đợi #{position}</Badge>
                </Flex>
              </Flex>

              <Separator size="4" />

              <Button variant="soft" color="gray" size="3" onClick={cancelSearch} style={{ cursor: "pointer" }}>
                <Cross2Icon /> Huỷ tìm kiếm
              </Button>
            </Flex>
          )}
        </div>

        <Text size="1" color="gray" style={{ display: "block", textAlign: "center", marginTop: 16 }}>
          Tên thật chỉ hiện khi 2 bên cùng thích nhau 💙
        </Text>
      </div>

      <style>{`@keyframes ripple{0%{transform:scale(0.4);opacity:0.9}100%{transform:scale(2);opacity:0}}`}</style>
    </div>
  );
}
