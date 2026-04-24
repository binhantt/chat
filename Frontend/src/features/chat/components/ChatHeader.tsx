import { HeartFilled, HeartOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Badge, Button, Space, Tag, Typography } from 'antd'
import type { ChatUser } from '../types/chat.types'
import { chatTheme } from '../chatTheme'

interface ChatHeaderProps {
  user: ChatUser
  identityRevealed?: boolean
  currentUserLiked?: boolean
  partnerLiked?: boolean
  onLike?: () => void
  likeLoading?: boolean
}

const statusLabelMap: Record<ChatUser['status'], string> = {
  Online: 'Đang hoạt động',
  Away: 'Tạm rời',
  Offline: 'Ngoại tuyến',
}

export default function ChatHeader({
  user,
  identityRevealed = true,
  currentUserLiked = false,
  partnerLiked = false,
  onLike,
  likeLoading = false,
}: ChatHeaderProps) {
  const headerLabel = identityRevealed
    ? statusLabelMap[user.status]
    : 'Ẩn danh cho đến khi một trong hai bấm thích'

  const canLike = !identityRevealed && Boolean(onLike)

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        background:
          'linear-gradient(180deg, rgba(12, 18, 32, 0.96) 0%, rgba(10, 15, 26, 0.9) 100%)',
        borderBottom: chatTheme.borderSoft,
        backdropFilter: 'blur(14px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Badge
          dot={user.status === 'Online'}
          color={user.status === 'Online' ? '#22c55e' : '#60a5fa'}
        >
          <Avatar
            src={user.avatar || undefined}
            size={42}
            style={{
              background:
                'linear-gradient(135deg, rgba(96,165,250,0.28), rgba(59,130,246,0.14))',
              color: '#eff6ff',
            }}
          >
            {user.isAnonymous ? <UserOutlined /> : user.name.charAt(0).toUpperCase()}
          </Avatar>
        </Badge>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Typography.Text strong style={{ color: chatTheme.textStrong, fontSize: 16 }} ellipsis>
            {user.name}
          </Typography.Text>
          <Typography.Text style={{ color: chatTheme.textMuted, fontSize: 12 }}>
            {headerLabel}
          </Typography.Text>
        </div>
      </div>
      <Space size={10}>
        {canLike && (
          <Button
            type="primary"
            icon={currentUserLiked ? <HeartFilled /> : <HeartOutlined />}
            loading={likeLoading}
            onClick={onLike}
            style={{
              borderRadius: 999,
              boxShadow: '0 14px 24px rgba(244, 63, 94, 0.18)',
            }}
          >
            {currentUserLiked ? 'Đã bày tỏ' : 'Thích để mở tên'}
          </Button>
        )}

        <Tag
          style={{
            marginInlineEnd: 0,
            borderRadius: 999,
            border: identityRevealed
              ? '1px solid rgba(96,165,250,0.22)'
              : '1px solid rgba(251,191,36,0.26)',
            background: identityRevealed
              ? 'rgba(96,165,250,0.12)'
              : 'rgba(251,191,36,0.12)',
            color: identityRevealed ? '#dbeafe' : '#fde68a',
            padding: '4px 10px',
          }}
        >
          {identityRevealed ? 'Đã mở tên' : (
            <>
              <LockOutlined /> Ẩn danh
            </>
          )}
        </Tag>

        {identityRevealed && partnerLiked && (
          <Tag
            style={{
              marginInlineEnd: 0,
              borderRadius: 999,
              border: '1px solid rgba(244,63,94,0.28)',
              background: 'rgba(244,63,94,0.12)',
              color: '#fecdd3',
              padding: '4px 10px',
            }}
          >
            <HeartFilled /> Đã có lượt thích
          </Tag>
        )}
      </Space>
    </div>
  )
}
