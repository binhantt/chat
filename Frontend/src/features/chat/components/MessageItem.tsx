import { UserOutlined } from '@ant-design/icons'
import { Avatar, Typography } from 'antd'
import type { ChatMessage } from '../types/chat.types'
import { chatTheme } from '../chatTheme'

interface MessageItemProps {
  message: ChatMessage
  isOwn: boolean
  senderName: string
  senderAvatar?: string
  senderAnonymous?: boolean
}

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function MessageItem({
  message,
  isOwn,
  senderName,
  senderAvatar,
  senderAnonymous = false,
}: MessageItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        alignItems: 'flex-end',
        gap: 10,
        marginBottom: 14,
      }}
    >
      {!isOwn && (
        <Avatar
          src={senderAvatar || undefined}
          size={34}
          style={{
            flex: '0 0 auto',
            background: senderAnonymous
              ? 'rgba(71,85,105,0.42)'
              : 'linear-gradient(135deg, rgba(96,165,250,0.24), rgba(59,130,246,0.14))',
            color: '#eff6ff',
          }}
        >
          {senderAnonymous ? <UserOutlined /> : senderName.charAt(0).toUpperCase()}
        </Avatar>
      )}

      <div
        style={{
          maxWidth: '72%',
          borderRadius: 18,
          padding: '12px 14px',
          background: isOwn
            ? 'linear-gradient(135deg, rgba(59,130,246,0.98), rgba(37,99,235,0.88))'
            : 'rgba(15, 23, 42, 0.88)',
          border: isOwn
            ? '1px solid rgba(96,165,250,0.22)'
            : '1px solid rgba(148,163,184,0.14)',
          boxShadow: isOwn ? '0 18px 30px rgba(37,99,235,0.18)' : chatTheme.shadowSoft,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography.Text
          style={{
            display: 'block',
            marginBottom: 6,
            color: isOwn ? 'rgba(255,255,255,0.9)' : 'rgba(191,219,254,0.92)',
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          {isOwn ? 'Bạn' : senderName}
        </Typography.Text>
        <Typography.Text
          style={{ color: '#ffffff', whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.55 }}
        >
          {message.text}
        </Typography.Text>
        <div style={{ marginTop: 6, textAlign: 'right' }}>
          <Typography.Text
            style={{
              color: isOwn ? 'rgba(255,255,255,0.8)' : 'rgba(226,232,240,0.56)',
              fontSize: 11,
            }}
          >
            {formatTime(message.createdAt)}
          </Typography.Text>
        </div>
      </div>

      {isOwn && (
        <Avatar
          src={senderAvatar || undefined}
          size={34}
          style={{
            flex: '0 0 auto',
            background: 'linear-gradient(135deg, rgba(96,165,250,0.28), rgba(59,130,246,0.14))',
            color: '#eff6ff',
          }}
        >
          {senderName.charAt(0).toUpperCase()}
        </Avatar>
      )}
    </div>
  )
}
