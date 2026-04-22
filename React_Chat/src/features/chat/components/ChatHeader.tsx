import { Avatar, Badge, Typography } from 'antd'
import type { ChatUser } from '../types/chat.types'

interface ChatHeaderProps {
  user: ChatUser
}

const statusLabelMap: Record<ChatUser['status'], string> = {
  Online: 'Online',
  Away: 'Away',
  Offline: 'Offline',
}

export default function ChatHeader({ user }: ChatHeaderProps) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: '#ffffff',
        borderBottom: '1px solid rgba(22,119,255,0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Badge dot={user.status === 'Online'} color="#1677ff">
          <Avatar src={user.avatar || undefined} size={42} />
        </Badge>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography.Text strong style={{ color: '#001529', fontSize: 16 }}>
            {user.name}
          </Typography.Text>
          <Typography.Text style={{ color: 'rgba(0,21,41,0.7)', fontSize: 12 }}>
            {statusLabelMap[user.status]}
          </Typography.Text>
        </div>
      </div>
    </div>
  )
}
