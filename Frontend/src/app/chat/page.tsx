"use client";

import { useSearchParams, Suspense } from "react";
import { AppLayout } from "@/features/layout/user";
import { ChatRoom } from "@/features/chat";
import { Text, Flex, Button } from "@radix-ui/themes";
import Link from "next/link";

function ChatPageInner() {
  const params = useSearchParams();
  const roomId = params.get("room");

  if (!roomId) {
    return (
      <Flex direction="column" align="center" justify="center" style={{ height: "100%", gap: 12 }}>
        <Text size="5" weight="bold" color="gray">Phòng chat không hợp lệ</Text>
        <Button asChild variant="soft"><Link href="/find">← Quay lại tìm kiếm</Link></Button>
      </Flex>
    );
  }

  return <ChatRoom roomId={roomId} />;
}

export default function ChatPage() {
  return (
    <AppLayout contentOverflow="hidden" contentBg="#0f172a">
      <Suspense fallback={<div style={{ height: "100%", background: "#0f172a" }} />}>
        <ChatPageInner />
      </Suspense>
    </AppLayout>
  );
}
