import { Button, Flex, Text } from "@radix-ui/themes";
import { ChatBubbleIcon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import type { AdminConversation } from "@/features/athu";
import { authTheme } from "@/features/athu/styles/authTheme";
import { chatPanelStyle } from "@/features/admin/styles/chatTheme";
import { ChatRow } from "./ChatRow";

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
  return (
    <Flex direction="column" gap="3" style={chatPanelStyle}>
      <Flex
        align={{ initial: "start", sm: "center" }}
        direction={{ initial: "column", sm: "row" }}
        gap="2"
        justify="between"
      >
        <Flex align="center" gap="2">
          <ChatBubbleIcon color={authTheme.control} />
          <Text size="4" weight="bold" style={{ color: authTheme.text }}>
            Danh sách hội thoại
          </Text>
        </Flex>
        <Text size="2" style={{ color: authTheme.muted }}>
          {filteredCount > 0 ? `Hiển thị ${showingFrom}-${showingTo}` : "Chưa có dữ liệu"}
        </Text>
      </Flex>

      {chats.length === 0 ? (
        <Flex align="center" direction="column" gap="2" justify="center" style={{ minHeight: 240 }}>
          <ChatBubbleIcon color={authTheme.control} height={42} width={42} />
          <Text size="3" weight="bold" style={{ color: authTheme.text }}>
            Không tìm thấy cuộc trò chuyện
          </Text>
          <Text size="2" style={{ color: authTheme.muted }}>
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
          <Text size="2" style={{ color: authTheme.muted }}>
            Trang {currentPage}
          </Text>
          <Flex align="center" gap="2">
            <Button disabled={!hasPrevious || loadingPage} onClick={onPrevious} size="2" variant="soft">
              <ChevronLeftIcon />
              Trước
            </Button>
            <Button disabled={!hasNext || loadingPage} onClick={onNext} size="2" variant="soft">
              {loadingPage ? "Đang tải..." : "Sau"}
              <ChevronRightIcon />
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
