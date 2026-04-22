import { Typography } from 'antd'
import type { ChatMessage } from '../types/chat.types'

interface MessageItemProps {
  message: ChatMessage
  isOwn: boolean
}

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function MessageItem({ message, isOwn }: MessageItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          maxWidth: '72%',
          borderRadius: 14,
          padding: '10px 12px',
          background: isOwn ? '#1677ff' : '#ffffff',
          border: isOwn ? '1px solid #1677ff' : '1px solid rgba(22,119,255,0.2)',
          boxShadow: '0 6px 14px rgba(0,21,41,0.08)',
        }}
      >
        <Typography.Text
          style={{ color: isOwn ? '#ffffff' : '#001529', whiteSpace: 'pre-wrap' }}
        >
          {message.text}
        </Typography.Text>
        <div style={{ marginTop: 6, textAlign: 'right' }}>
          <Typography.Text
            style={{
              color: isOwn ? 'rgba(255,255,255,0.82)' : 'rgba(0,21,41,0.62)',
              fontSize: 11,
            }}
          >
            {formatTime(message.createdAt)}
          </Typography.Text>
        </div>
      </div>
    </div>
  )
}
