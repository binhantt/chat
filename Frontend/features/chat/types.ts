export type CenterMode = "search" | "chat" | "match";

export interface MatchedUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  badge: string | null;
  gender: string | null;
  city: string | null;
}

export interface ChatSessionState {
  selectedUser: string | null;
  conversationId: string | null;
  matchedUser: MatchedUser | null;
}
