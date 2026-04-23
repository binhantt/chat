import { Grid, Layout } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../auth/store/auth.store'
import Sidebar from './Sidebar'

const { Sider, Content } = Layout

export default function ChatLayout() {
  const screens = Grid.useBreakpoint()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isLoading = useAuthStore((state) => state.isLoading)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout style={{ height: '100vh', background: '#ffffff' }}>
      <Sider
        width={screens.lg ? 330 : 290}
        style={{ background: '#fcfdff', borderRight: '1px solid rgba(0,21,41,0.12)' }}
        theme="light"
      >
        <Sidebar
          currentUserName={user?.displayName ?? 'Guest User'}
          currentUserEmail={user?.email}
          logoutLoading={isLoading}
          onLogout={handleLogout}
        />
      </Sider>

      <Content style={{ minWidth: 0, background: '#ffffff' }}>
        <Outlet />
      </Content>
    </Layout>
  )
}
