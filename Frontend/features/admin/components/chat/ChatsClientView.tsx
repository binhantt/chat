"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Callout, Flex, Spinner, Text } from "@radix-ui/themes";
import { getAdminConversations, type AdminConversation } from "@/features/athu";
import {
  ChatDetailDialog,
  ChatHeader,
  ChatListPanel,
  ChatStatGrid,
  ChatToolbar,
  type ChatStatusFilter,
} from "@/features/admin/components/chat";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

const CHATS_PAGE_SIZE = 8;
const EMPTY_CHAT_STATS = {
  active: 0,
  blocked: 0,
  ended: 0,
  total: 0,
};

export function ChatsClientView() {
  const s = useAdminStyles();
  const fetchedStatusRef = useRef<ChatStatusFilter | null>(null);
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [pageChanging, setPageChanging] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedChat, setSelectedChat] = useState<AdminConversation | null>(null);
  const [stats, setStats] = useState(EMPTY_CHAT_STATS);
  const [statusFilter, setStatusFilter] = useState<ChatStatusFilter>("all");
  const debouncedSearch = useDebouncedValue(search);

  const fetchConversationsPage = useCallback(
    async (cursor: string | null, silent = false) => {
      if (silent) {
        setPageChanging(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const page = await getAdminConversations({
          cursor,
          limit: CHATS_PAGE_SIZE,
          status: statusFilter,
        });
        setConversations(page.items);
        setNextCursor(page.nextCursor);
        setStats(page.stats ?? EMPTY_CHAT_STATS);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError("Không thể tải danh sách cuộc trò chuyện");
      } finally {
        setLoading(false);
        setPageChanging(false);
      }
    },
    [statusFilter],
  );

  const fetchConversations = useCallback(async () => {
    setCurrentCursor(null);
    setCurrentPage(1);
    setCursorStack([]);
    await fetchConversationsPage(null);
  }, [fetchConversationsPage]);

  const goNextPage = useCallback(async () => {
    if (!nextCursor || pageChanging) return;

    const nextPageCursor = nextCursor;
    setCursorStack((current) => [...current, currentCursor]);
    setCurrentCursor(nextPageCursor);
    setCurrentPage((page) => page + 1);
    await fetchConversationsPage(nextPageCursor, true);
  }, [currentCursor, fetchConversationsPage, nextCursor, pageChanging]);

  const goPreviousPage = useCallback(async () => {
    if (cursorStack.length === 0 || pageChanging) return;

    const previousCursor = cursorStack[cursorStack.length - 1] ?? null;
    setCursorStack((current) => current.slice(0, -1));
    setCurrentCursor(previousCursor);
    setCurrentPage((page) => Math.max(1, page - 1));
    await fetchConversationsPage(previousCursor, true);
  }, [cursorStack, fetchConversationsPage, pageChanging]);

  useEffect(() => {
    if (fetchedStatusRef.current === statusFilter) return;

    fetchedStatusRef.current = statusFilter;
    queueMicrotask(() => {
      void fetchConversations();
    });
  }, [fetchConversations, statusFilter]);

  const filtered = useMemo(
    () =>
      conversations.filter((chat) => {
        const normalizedSearch = debouncedSearch.trim().toLowerCase();
        const user1Info = chat.user1?.fullName || chat.user1?.email || chat.user1Id || "";
        const user2Info = chat.user2?.fullName || chat.user2?.email || chat.user2Id || "";
        const matchesSearch =
          !normalizedSearch ||
          user1Info.toLowerCase().includes(normalizedSearch) ||
          user2Info.toLowerCase().includes(normalizedSearch) ||
          chat.id.toLowerCase().includes(normalizedSearch);

        return matchesSearch;
      }),
    [conversations, debouncedSearch],
  );

  const showingFrom = filtered.length > 0 ? (currentPage - 1) * CHATS_PAGE_SIZE + 1 : 0;
  const showingTo = filtered.length > 0 ? showingFrom + filtered.length - 1 : 0;

  if (loading) {
    return (
      <Flex align="center" justify="center" className={s.chat.loadingContainer}>
        <Flex align="center" direction="column" gap="3">
          <Spinner size="3" />
          <Text className={s.chat.loadingText}>Đang tải danh sách cuộc trò chuyện...</Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="5">
      <ChatHeader count={stats.total} onRefresh={fetchConversations} />

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <ChatStatGrid stats={stats} />
      <ChatToolbar
        filteredCount={filtered.length}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        search={search}
        status={statusFilter}
        totalCount={stats.total}
      />
      <ChatListPanel
        chats={filtered}
        currentPage={currentPage}
        filteredCount={filtered.length}
        hasNext={Boolean(nextCursor)}
        hasPrevious={cursorStack.length > 0}
        loadingPage={pageChanging}
        onNext={goNextPage}
        onPrevious={goPreviousPage}
        onView={setSelectedChat}
        showingFrom={showingFrom}
        showingTo={showingTo}
      />

      <ChatDetailDialog chat={selectedChat} onClose={() => setSelectedChat(null)} />
    </Flex>
  );
}
