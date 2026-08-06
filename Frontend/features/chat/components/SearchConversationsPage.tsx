"use client";

import { SearchPeople } from "./SearchPeople";
import type { MatchedUser } from "../types";

type SearchConversationsPageProps = {
  selectedConversationId?: string | null;
  onSelectConversation?: (convId: string, partner: MatchedUser) => void;
};

export function SearchConversationsPage({
  selectedConversationId,
  onSelectConversation,
}: SearchConversationsPageProps) {
  return (
    <SearchPeople
      selectedConversationId={selectedConversationId}
      onSelectConversation={onSelectConversation as any}
    />
  );
}
