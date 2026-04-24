import { CloseOutlined, MessageOutlined } from '@ant-design/icons'
import { Button, Input, Typography } from 'antd'
import { useState } from 'react'
import { chatTheme } from '../chatTheme'

interface ChatInputProps {
  onSend: (value: string) => void
  onExitConversation?: () => void
}

export default function ChatInput({ onSend, onExitConversation }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    const content = value.trim()
    if (!content) return
    onSend(content)
    setValue('')
  }

  return (
    <div
      style={{
        padding: '12px 14px 14px',
        borderTop: chatTheme.borderSoft,
        background:
          'linear-gradient(180deg, rgba(10, 16, 28, 0.92) 0%, rgba(8, 13, 24, 0.98) 100%)',
        boxShadow: '0 -12px 30px rgba(2, 6, 23, 0.18)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <Typography.Text style={{ color: chatTheme.textSubtle, fontSize: 11.5 }}>
          Nhấn Enter để gửi, dùng nút bên trái để thoát cuộc trò chuyện hiện tại.
        </Typography.Text>

        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 8,
          }}
        >
          {onExitConversation && (
            <Button
              icon={<CloseOutlined />}
              onClick={onExitConversation}
              style={{
                height: 44,
                borderRadius: 12,
                borderColor: 'rgba(148,163,184,0.2)',
                background: 'rgba(255,255,255,0.04)',
                color: chatTheme.textStrong,
                flex: '0 0 auto',
              }}
            >
              Thoát
            </Button>
          )}

          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Nhập tin nhắn..."
            onPressEnter={handleSend}
            size="large"
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: 12,
              borderColor: 'rgba(148,163,184,0.2)',
              background: 'rgba(255,255,255,0.04)',
              color: chatTheme.textStrong,
            }}
            prefix={<MessageOutlined style={{ color: '#93c5fd' }} />}
          />
        </div>
      </div>
    </div>
  )
}
