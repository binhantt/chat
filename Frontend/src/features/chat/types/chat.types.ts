export type ChatStatus = 'Online' | 'Away' | 'Offline'

export interface ChatUser {
  id: string
  name: string
  avatar: string
  status: ChatStatus
  isAnonymous?: boolean
}

export interface Conversation {
  id: string
  participant: ChatUser
  unreadCount?: number
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  text: string
  createdAt: string
}

export interface ChatRoomSummary {
  id: string
  active: boolean
  identityRevealed: boolean
  currentUserLiked: boolean
  partnerLiked: boolean
  partner: ChatUser
}
