import { App as AntdApp, Grid, Layout } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../auth/store/auth.store'
import Sidebar from './Sidebar'
import { chatTheme } from '../chatTheme'
import { API_ENDPOINTS, APP_CONFIG } from '../../../shared/constants/config'
import type { ChatSearchUser } from '../services/chat.service'

const { Sider, Content } = Layout

export interface ChatLayoutOutletContext {
  setHideSidebar: (hidden: boolean) => void
}

interface MatchmakingNotificationPayload {
  type?: string
  roomId?: string
  title?: string
  content?: string
  metadata?: {
    kind?: string
    roomId?: string
    partner?: ChatSearchUser
  }
}

export default function ChatLayout() {
  const { message: messageApi } = AntdApp.useApp()
  const screens = Grid.useBreakpoint()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [hideSidebar, setHideSidebar] = useState(false)
  const pathnameRef = useRef(location.pathname)

  useEffect(() => {
    pathnameRef.current = location.pathname
  }, [location.pathname])

  useEffect(() => {
    let isClosed = false
    const streamBaseUrl = `${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS.STREAM}`
    const eventSource = new EventSource(streamBaseUrl, { withCredentials: true })

    const handleNotification = (event: MessageEvent<string>) => {
      if (isClosed) return

      try {
        const notification = JSON.parse(event.data) as MatchmakingNotificationPayload

        if (
          notification.type !== 'SYSTEM' ||
          !notification.roomId
        ) {
          return
        }

        if (notification.metadata?.kind === 'MATCHMAKING_MATCHED') {
          navigate(`/chat/tro-chuyen/${notification.roomId}`, {
            replace: true,
            state: {
              participant: notification.metadata?.partner,
            },
          })
          return
        }

        if (
          notification.metadata?.kind === 'CONVERSATION_ENDED' &&
          pathnameRef.current.startsWith('/chat/tro-chuyen')
        ) {
          messageApi.info(notification.content || 'Người kia đã rời cuộc trò chuyện.')
          navigate('/chat/tim-kiem', { replace: true })
        }
      } catch {
        return
      }
    }

    eventSource.addEventListener('notification', handleNotification as EventListener)

    return () => {
      isClosed = true
      eventSource.removeEventListener('notification', handleNotification as EventListener)
      eventSource.close()
    }
  }, [navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div
      style={{
        height: '100dvh',
        padding: screens.lg ? 16 : 0,
        background: chatTheme.outerBg,
        overflow: 'hidden',
      }}
    >
      <Layout
        style={{
          height: '100%',
          minHeight: 0,
          background: chatTheme.shellBg,
          border: screens.lg ? chatTheme.border : 'none',
          borderRadius: screens.lg ? 28 : 0,
          overflow: 'hidden',
          boxShadow: screens.lg ? chatTheme.shadow : 'none',
        }}
      >
        {!hideSidebar && (
          <Sider
            width={screens.lg ? 332 : screens.md ? 282 : 236}
            style={{
              height: '100%',
              background: chatTheme.shellPanel,
              borderRight: chatTheme.borderSoft,
              overflow: 'hidden',
            }}
            theme="dark"
          >
            <Sidebar
              currentUserName={user?.displayName ?? 'Guest User'}
              currentUserEmail={user?.email}
              logoutLoading={isLoading}
              onLogout={handleLogout}
            />
          </Sider>
        )}

        <Content
          style={{
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            background: 'transparent',
          }}
        >
          <Outlet context={{ setHideSidebar }} />
        </Content>
      </Layout>
    </div>
  )
}
