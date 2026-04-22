export type ChatStatus = 'Online' | 'Away' | 'Offline'

export interface ChatUser {
  id: string
  name: string
  avatar: string
  status: ChatStatus
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
