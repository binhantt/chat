import { Button, Flex, Text } from "@radix-ui/themes";
import { ChatBubbleIcon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import type { AdminConversation } from "@/features/athu";
import { ChatRow } from "./ChatRow";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function ChatListPanel({
  chats,
  currentPage,
  filteredCount,
  hasNext,
  hasPrevious,
  loadingPage,
  onNext,
  onPrevious,
  onView,
  showingFrom,
  showingTo,
}: {
  chats: AdminConversation[];
  currentPage: number;
  filteredCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  loadingPage: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onView: (chat: AdminConversation) => void;
  showingFrom: number;
  showingTo: number;
}) {
  const s = useAdminStyles();
  return (
    <Flex direction="column" gap="3" className={s.chat.listPanel}>
      <Flex
        align={{ initial: "start", sm: "center" }}
        direction={{ initial: "column", sm: "row" }}
        gap="2"
        justify="between"
      >
        <Flex align="center" gap="2">
          <ChatBubbleIcon color="var(--primary)" />
          <Text size="4" weight="bold" className={s.chat.listTitle}>
            Danh sách hội thoại
          </Text>
        </Flex>
        <Text size="2" className={s.chat.listInfo}>
          {filteredCount > 0 ? `Hiển thị ${showingFrom}-${showingTo}` : "Chưa có dữ liệu"}
        </Text>
      </Flex>

      {chats.length === 0 ? (
        <Flex align="center" direction="column" gap="2" justify="center" className={s.chat.emptyState}>
          <ChatBubbleIcon color="var(--primary)" height={42} width={42} />
          <Text size="3" weight="bold" className={s.chat.emptyTitle}>
            Không tìm thấy cuộc trò chuyện
          </Text>
          <Text size="2" className={s.chat.emptyDesc}>
            Thử đổi bộ lọc hoặc từ khóa tìm kiếm.
          </Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="3">
          {chats.map((chat) => (
            <ChatRow chat={chat} key={chat.id} onView={onView} />
          ))}
        </Flex>
      )}

      {filteredCount > 0 && (
        <Flex align="center" gap="3" justify="between" pt="1" wrap="wrap">
          <Text size="2" className={s.chat.listInfo}>
            Trang {currentPage}
          </Text>
          <Flex align="center" gap="2">
            <Button disabled={!hasPrevious || loadingPage} onClick={onPrevious} size="2" variant="soft" className={s.chat.headerBtn}>
              <ChevronLeftIcon />
              Trước
            </Button>
            <Button disabled={!hasNext || loadingPage} onClick={onNext} size="2" variant="soft" className={s.chat.headerBtn}>
              {loadingPage ? "Đang tải..." : "Sau"}
              <ChevronRightIcon />
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
