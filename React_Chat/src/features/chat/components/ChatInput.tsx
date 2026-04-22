import { CloseOutlined, SmileOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Input, Space } from 'antd'
import { useState } from 'react'

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
        padding: 16,
        borderTop: '1px solid rgba(22,119,255,0.2)',
        background: '#ffffff',
      }}
    >
      <Space.Compact style={{ width: '100%' }}>
        {onExitConversation && (
          <Button
            icon={<CloseOutlined />}
            onClick={onExitConversation}
            style={{
              background: '#ffffff',
              borderColor: 'rgba(22,119,255,0.35)',
              color: '#001529',
            }}
          >
            Thoat
          </Button>
        )}
        <Button
          icon={<SmileOutlined />}
          style={{
            background: '#ffffff',
            borderColor: 'rgba(22,119,255,0.35)',
            color: '#1677ff',
          }}
        />
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onPressEnter={handleSend}
          placeholder="Type a message..."
          style={{ borderColor: 'rgba(22,119,255,0.35)' }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
          Send
        </Button>
      </Space.Compact>
    </div>
  )
}
