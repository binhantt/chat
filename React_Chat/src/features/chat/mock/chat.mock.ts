import type { ChatMessage, Conversation } from '../types/chat.types'

export const CURRENT_USER_ID = 'u-me'

export const conversations: Conversation[] = [
  {
    id: 'c-1',
    participant: {
      id: 'u-1',
      name: 'Sophia Carter',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia',
      status: 'Online',
    },
    unreadCount: 2,
  },
  {
    id: 'c-2',
    participant: {
      id: 'u-2',
      name: 'Liam Nguyen',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Liam',
      status: 'Away',
    },
  },
  {
    id: 'c-3',
    participant: {
      id: 'u-3',
      name: 'Emma Wilson',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Emma',
      status: 'Offline',
    },
  },
]

export const messagesByConversation: Record<string, ChatMessage[]> = {
  'c-1': [
    {
      id: 'm-1',
      conversationId: 'c-1',
      senderId: 'u-1',
      text: 'Hi! Did you review the new dashboard draft?',
      createdAt: '2026-04-22T10:08:00.000Z',
    },
    {
      id: 'm-2',
      conversationId: 'c-1',
      senderId: CURRENT_USER_ID,
      text: 'Yes, it looks great. I left a few notes on spacing.',
      createdAt: '2026-04-22T10:10:00.000Z',
    },
    {
      id: 'm-3',
      conversationId: 'c-1',
      senderId: 'u-1',
      text: 'Perfect, I will update it this afternoon.',
      createdAt: '2026-04-22T10:11:00.000Z',
    },
  ],
  'c-2': [
    {
      id: 'm-4',
      conversationId: 'c-2',
      senderId: CURRENT_USER_ID,
      text: 'Can we sync at 3 PM?',
      createdAt: '2026-04-22T08:32:00.000Z',
    },
    {
      id: 'm-5',
      conversationId: 'c-2',
      senderId: 'u-2',
      text: 'Sure, send me the meeting link.',
      createdAt: '2026-04-22T08:35:00.000Z',
    },
  ],
  'c-3': [
    {
      id: 'm-6',
      conversationId: 'c-3',
      senderId: 'u-3',
      text: 'Thanks for the quick help yesterday.',
      createdAt: '2026-04-21T18:14:00.000Z',
    },
  ],
}
