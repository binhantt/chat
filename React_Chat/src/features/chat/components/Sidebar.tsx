import {
  MessageOutlined,
  FormOutlined,
  SettingOutlined,
  SearchOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Menu, Typography } from 'antd'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface SidebarProps {
  currentUserName: string
  currentUserEmail?: string
  logoutLoading?: boolean
  onLogout: () => void
}

const menuItems = [
  { key: '/chat/tro-chuyen', label: 'Tro chuyen', icon: <MessageOutlined /> },
  { key: '/chat/phan-anh', label: 'Phan anh', icon: <FormOutlined /> },
  { key: '/chat/cai-dat', label: 'Cai dat', icon: <SettingOutlined /> },
  { key: '/chat/tim-kiem', label: 'Tim kiem', icon: <SearchOutlined /> },
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
        background: '#f2f3f5',
      }}
    >
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid rgba(0,21,41,0.12)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: 12 }}>
            <Avatar size={40} style={{ background: '#1677ff', color: '#ffffff' }}>
              {currentUserName.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ minWidth: 0 }}>
              <Typography.Text
                strong
                style={{ display: 'block', color: '#001529', fontSize: 16, lineHeight: '20px' }}
                ellipsis
              >
                {currentUserName}
              </Typography.Text>
              <Typography.Text
                style={{ display: 'block', color: 'rgba(0,21,41,0.65)', fontSize: 12 }}
                ellipsis
              >
                {currentUserEmail ?? 'Da dang nhap'}
              </Typography.Text>
            </div>
          </div>

          <Button
            icon={<LogoutOutlined />}
            onClick={onLogout}
            loading={logoutLoading}
            style={{
              borderColor: 'rgba(22,119,255,0.5)',
              borderRadius: 14,
              background: '#f8f9fb',
              color: '#001529',
              height: 40,
            }}
          >
            Dang xuat
          </Button>
        </div>
      </div>

      <Menu
        mode="inline"
        items={menuItems}
        selectedKeys={selectedKeys}
        onClick={({ key }) => navigate(key)}
        style={{
          borderInlineEnd: 'none',
          flex: 1,
          background: '#f2f3f5',
          padding: '10px 8px',
        }}
      />
    </div>
  )
}
