import {
  MessageOutlined,
  FormOutlined,
  SettingOutlined,
  SearchOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { Button, Divider, Menu, Typography } from 'antd'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { chatTheme } from '../chatTheme'

interface SidebarProps {
  currentUserName: string
  currentUserEmail?: string
  logoutLoading?: boolean
  onLogout: () => void
}

const menuItems = [
  { key: '/chat/tro-chuyen', label: 'Trò chuyện', icon: <MessageOutlined /> },
  { key: '/chat/phan-anh', label: 'Phản hồi', icon: <FormOutlined /> },
  { key: '/chat/cai-dat', label: 'Cài đặt', icon: <SettingOutlined /> },
  { key: '/chat/tim-kiem', label: 'Tìm kiếm', icon: <SearchOutlined /> },
]

export default function Sidebar({
  currentUserName,
  currentUserEmail,
  logoutLoading,
  onLogout,
}: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const selectedKeys = useMemo(() => {
    const activeItem = menuItems.find((item) => location.pathname.startsWith(item.key))
    return [activeItem?.key ?? '/chat/tro-chuyen']
  }, [location.pathname])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, rgba(10, 18, 32, 0.96) 0%, rgba(8, 13, 24, 0.98) 100%)',
        color: chatTheme.text,
      }}
    >
      <div
        style={{
          padding: 18,
          borderBottom: chatTheme.borderSoft,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 14,
            borderRadius: 18,
            background: 'rgba(255, 255, 255, 0.04)',
            border: chatTheme.borderSoft,
            boxShadow: chatTheme.shadowSoft,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, rgba(96,165,250,0.28), rgba(59,130,246,0.14))',
              border: '1px solid rgba(96, 165, 250, 0.22)',
              color: '#dbeafe',
            }}
          >
            <AppstoreOutlined />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Typography.Text style={{ display: 'block', color: '#f8fafc', fontWeight: 700 }}>
              {currentUserName}
            </Typography.Text>
            <Typography.Text style={{ display: 'block', color: chatTheme.textMuted, fontSize: 12 }} ellipsis>
              {currentUserEmail ?? 'Đã đăng nhập bằng Google'}
            </Typography.Text>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '14px 12px 10px',
          color: chatTheme.textMuted,
          fontSize: 12,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}
      >
        Khu làm việc
      </div>

      <Menu
        mode="inline"
        theme="dark"
        items={menuItems}
        selectedKeys={selectedKeys}
        onClick={({ key }) => navigate(key)}
        style={{
          borderInlineEnd: 'none',
          flex: 1,
          background: 'transparent',
          padding: '0 10px',
        }}
      />

      <Divider
        style={{
          margin: '6px 18px 0',
          borderColor: 'rgba(148, 163, 184, 0.14)',
        }}
      />

      <div
        style={{
          padding: 18,
        }}
      >
        <Button
          block
          icon={<LogoutOutlined />}
          onClick={onLogout}
          loading={logoutLoading}
          style={{
            height: 44,
            borderRadius: 14,
            borderColor: 'rgba(96, 165, 250, 0.28)',
            background: 'rgba(255, 255, 255, 0.04)',
            color: chatTheme.textStrong,
            boxShadow: '0 10px 20px rgba(2, 6, 23, 0.18)',
          }}
        >
          Đăng xuất
        </Button>
      </div>
      <div
        style={{
          padding: '0 18px 18px',
          color: chatTheme.textSubtle,
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        Chuyển đổi nhanh giữa trò chuyện, phản hồi, tìm kiếm và cài đặt.
      </div>
    </div>
  )
}
