import type { ReactNode } from "react";
import { Box, Text } from "@radix-ui/themes";
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import type { CenterMode } from "../types";

type ChatSidebarActionsProps = {
  mode: CenterMode;
  onMatch: () => void;
  onSearch: () => void;
};

export function ChatSidebarActions({
  mode,
  onMatch,
  onSearch,
}: ChatSidebarActionsProps) {
  return (
    <Box className="chat-sidebar-actions">
      <ChatActionButton
        active={mode === "search"}
        icon={<MagnifyingGlassIcon width="18" height="18" />}
        label="Tìm hội thoại"
        onClick={onSearch}
        subLabel="Người đã trò chuyện"
      />
      <ChatActionButton
        active={mode === "match"}
        icon={<PersonIcon width="18" height="18" />}
        label="Tìm kiếm người"
        onClick={onMatch}
        subLabel="Ghép đôi mới"
      />
    </Box>
  );
}

function ChatActionButton({
  active,
  icon,
  label,
  onClick,
  subLabel,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  subLabel: string;
}) {
  return (
    <button
      type="button"
      className="chat-action-button"
      data-active={active}
      onClick={onClick}
    >
      <span className="chat-action-icon">{icon}</span>
      <span style={{ minWidth: 0 }}>
        <Text size="2" weight="bold" as="div" className="chat-list-title">
          {label}
        </Text>
        <Text size="1" className="chat-muted chat-list-title" as="div">
          {subLabel}
        </Text>
      </span>
      <ArrowRightIcon className="chat-action-arrow" height={14} width={14} />
    </button>
  );
}
