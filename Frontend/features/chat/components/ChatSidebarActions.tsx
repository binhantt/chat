import type { ReactNode } from "react";
import { Box, Text } from "@radix-ui/themes";
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import type { CenterMode } from "../types";

type ChatSidebarActionsProps = {
  mode: CenterMode;
  onSearch: () => void;
};

export function ChatSidebarActions({
  mode,
  onSearch,
}: ChatSidebarActionsProps) {
  return (
    <Box className="chat-sidebar-actions">
      <ChatActionButton
        active={mode === "search"}
        icon={<MagnifyingGlassIcon width="18" height="18" />}
        label="Tim kiem cuoc tro chuyen"
        onClick={onSearch}
      />
    </Box>
  );
}

function ChatActionButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
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
      </span>
      <ArrowRightIcon className="chat-action-arrow" height={14} width={14} />
    </button>
  );
}
