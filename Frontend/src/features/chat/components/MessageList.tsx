import { Empty } from 'antd'
import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types/chat.types'
import MessageItem from './MessageItem'
import { chatTheme } from '../chatTheme'
import type { ChatUser } from '../types/chat.types'

interface MessageListProps {
  messages: ChatMessage[]
  currentUserId: string
  currentUserName: string
  partner: ChatUser
}

export default function MessageList({
  messages,
  currentUserId,
  currentUserName,
  partner,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(180deg, rgba(10, 16, 28, 0.96) 0%, rgba(15, 23, 42, 0.9) 100%)',
          padding: 24,
        }}
      >
        <Empty
          description="Chưa có tin nhắn trong cuộc trò chuyện này"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ color: chatTheme.textMuted }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        height: '100%',
        minHeight: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '18px 20px 20px',
        background:
          'linear-gradient(180deg, rgba(10, 16, 28, 0.96) 0%, rgba(15, 23, 42, 0.94) 36%, rgba(15, 23, 42, 0.98) 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
            senderName={message.senderId === currentUserId ? currentUserName : partner.name}
            senderAvatar={message.senderId === currentUserId ? undefined : partner.avatar}
            senderAnonymous={message.senderId !== currentUserId && partner.isAnonymous}
          />
        ))}
      </div>
      <div ref={endRef} />
    </div>
  )
}
