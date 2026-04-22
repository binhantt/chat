import { Empty } from 'antd'
import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types/chat.types'
import MessageItem from './MessageItem'

interface MessageListProps {
  messages: ChatMessage[]
  currentUserId: string
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
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
          background: '#ffffff',
        }}
      >
        <Empty description="No messages yet" />
      </div>
    )
  }

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        padding: '16px',
        background:
          'linear-gradient(180deg, rgba(22,119,255,0.08) 0%, #ffffff 35%, #ffffff 100%)',
      }}
    >
      <div>
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
          />
        ))}
      </div>
      <div ref={endRef} />
    </div>
  )
}
