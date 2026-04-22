import { Button, Empty, Layout, message } from 'antd'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useAuthStore } from '../../auth/store/auth.store'
import { API_ENDPOINTS, APP_CONFIG } from '../../../shared/constants/config'
import { getAccessTokenFromAuthCookie } from '../../../shared/utils/cookieAuthStorage'
import type { ChatLayoutOutletContext } from '../components/ChatLayout'
import ChatHeader from '../components/ChatHeader'
import ChatInput from '../components/ChatInput'
import MessageList from '../components/MessageList'
import chatService, { type ChatSearchUser } from '../services/chat.service'
import type { ChatMessage, ChatUser } from '../types/chat.types'

const { Header, Content, Footer } = Layout

interface ConversationLocationState {
  participant?: ChatSearchUser
}

interface RealtimeNotification {
  id: string
  type: 'MESSAGE' | 'SYSTEM' | 'ALERT'
  roomId?: string
  senderId?: string
  content: string
  createdAt: string
  metadata?: Record<string, unknown>
}

const toChatStatus = (value?: string): ChatUser['status'] => {
  const normalized = String(value ?? '').toLowerCase()
  if (normalized === 'online') return 'Online'
  if (normalized === 'away') return 'Away'
  return 'Offline'
}

const toChatUser = (partner?: ChatSearchUser): ChatUser => ({
  id: partner?.id ?? 'unknown',
  name: partner?.name ?? 'Doi tac moi',
  avatar: partner?.avatar ?? '',
  status: toChatStatus(partner?.status),
})

export default function ConversationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { roomId } = useParams<{ roomId?: string }>()
  const currentUserId = useAuthStore((state) => state.user?.id ?? 'u-me')
  const { setHideSidebar } = useOutletContext<ChatLayoutOutletContext>()
  const [messagesByConversation, setMessagesByConversation] =
    useState<Record<string, ChatMessage[]>>({})
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isExitedConversation, setIsExitedConversation] = useState(false)

  const activeRoomId = roomId ?? null
  const locationState = location.state as ConversationLocationState | null
  const participant = useMemo(
    () => toChatUser(locationState?.participant),
    [locationState?.participant]
  )

  const messages = useMemo(
    () => (activeRoomId ? messagesByConversation[activeRoomId] ?? [] : []),
    [activeRoomId, messagesByConversation]
  )

  useEffect(() => {
    if (!activeRoomId) return

    let cancelled = false
    const loadHistory = async () => {
      try {
        setIsLoadingHistory(true)
        const history = await chatService.getRoomHistory(activeRoomId)
        if (cancelled) return
        setMessagesByConversation((prev) => ({
          ...prev,
          [activeRoomId]: history,
        }))
      } catch (error) {
        if (cancelled) return
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/login', { replace: true })
        }
      } finally {
        if (!cancelled) {
          setIsLoadingHistory(false)
        }
      }
    }

    void loadHistory()
    return () => {
      cancelled = true
    }
  }, [activeRoomId, navigate])

  useEffect(() => {
    if (!activeRoomId) return

    let isClosed = false
    let fallbackPollingId: number | null = null
    let fallbackPollingEnabled = false
    let fallbackFailureCount = 0
    let connectionErrorShown = false

    const upsertHistoryIfChanged = (history: ChatMessage[]) => {
      setMessagesByConversation((prev) => {
        const current = prev[activeRoomId] ?? []
        const currentLastId = current[current.length - 1]?.id
        const nextLastId = history[history.length - 1]?.id
        if (current.length === history.length && currentLastId === nextLastId) {
          return prev
        }
        return {
          ...prev,
          [activeRoomId]: history,
        }
      })
    }

    const syncRoomHistory = async () => {
      try {
        const history = await chatService.getRoomHistory(activeRoomId)
        if (isClosed) return
        fallbackFailureCount = 0
        connectionErrorShown = false
        upsertHistoryIfChanged(history)

        if (fallbackPollingEnabled) {
          fallbackPollingId = window.setTimeout(() => {
            void syncRoomHistory()
          }, 2500)
        }
      } catch (error) {
        if (isClosed) return

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          stopFallbackPolling()
          navigate('/login', { replace: true })
          return
        }

        fallbackFailureCount += 1
        if (fallbackFailureCount >= 5) {
          stopFallbackPolling()
          if (!connectionErrorShown) {
            connectionErrorShown = true
            message.error('Khong ket noi duoc server chat. Vui long thu lai sau.')
          }
          return
        }

        if (fallbackPollingEnabled) {
          const retryDelay = Math.min(15000, 2500 * 2 ** fallbackFailureCount)
          fallbackPollingId = window.setTimeout(() => {
            void syncRoomHistory()
          }, retryDelay)
        }
      }
    }

    const startFallbackPolling = () => {
      if (fallbackPollingEnabled) return
      fallbackPollingEnabled = true
      void syncRoomHistory()
    }

    const stopFallbackPolling = () => {
      fallbackPollingEnabled = false
      if (fallbackPollingId !== null) {
        window.clearTimeout(fallbackPollingId)
        fallbackPollingId = null
      }
    }

    const accessToken = getAccessTokenFromAuthCookie()
    const streamBaseUrl = `${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS.STREAM}`
    const streamUrl = accessToken
      ? `${streamBaseUrl}?accessToken=${encodeURIComponent(accessToken)}`
      : streamBaseUrl
    const eventSource = new EventSource(streamUrl, { withCredentials: true })

    const handleNotification = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as RealtimeNotification
        if (data.type !== 'MESSAGE') return
        if (data.roomId !== activeRoomId) return
        if (!data.senderId || data.senderId === currentUserId) return

        const messageIdFromMeta =
          typeof data.metadata?.messageId === 'string' ? data.metadata.messageId : undefined
        const incomingMessage: ChatMessage = {
          id: messageIdFromMeta ?? data.id ?? `m-${Date.now()}`,
          conversationId: data.roomId,
          senderId: data.senderId,
          text: data.content,
          createdAt: data.createdAt ?? new Date().toISOString(),
        }

        setMessagesByConversation((prev) => {
          const current = prev[activeRoomId] ?? []
          if (current.some((item) => item.id === incomingMessage.id)) {
            return prev
          }
          return {
            ...prev,
            [activeRoomId]: [...current, incomingMessage],
          }
        })
      } catch {
        return
      }
    }

    eventSource.addEventListener('notification', handleNotification as EventListener)
    eventSource.onopen = () => {
      stopFallbackPolling()
    }
    eventSource.onerror = () => {
      // If stream is unavailable, fallback to pull history with backoff.
      eventSource.close()
      startFallbackPolling()
    }

    return () => {
      isClosed = true
      stopFallbackPolling()
      eventSource.removeEventListener('notification', handleNotification as EventListener)
      eventSource.close()
    }
  }, [activeRoomId, currentUserId, navigate])

  useEffect(() => {
    setIsExitedConversation(false)
  }, [activeRoomId])

  const showNoConversationState = !activeRoomId || isExitedConversation

  useEffect(() => {
    setHideSidebar(showNoConversationState)
    return () => {
      setHideSidebar(false)
    }
  }, [setHideSidebar, showNoConversationState])

  const handleSendMessage = async (text: string) => {
    if (!activeRoomId) return

    const fallbackMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: activeRoomId,
      senderId: currentUserId,
      text,
      createdAt: new Date().toISOString(),
    }

    try {
      const apiMessage = await chatService.sendMessage({
        roomId: activeRoomId,
        content: text,
      })

      setMessagesByConversation((prev) => ({
        ...prev,
        [activeRoomId]: [...(prev[activeRoomId] ?? []), apiMessage],
      }))
    } catch {
      setMessagesByConversation((prev) => ({
        ...prev,
        [activeRoomId]: [...(prev[activeRoomId] ?? []), fallbackMessage],
      }))
      message.warning('Khong gui duoc len server, da luu tam tren giao dien.')
    }
  }

  const handleExitConversation = () => {
    setIsExitedConversation(true)
    navigate('/chat/tro-chuyen', { replace: true })
  }

  if (showNoConversationState) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
        }}
      >
        <Empty
          description={
            isExitedConversation
              ? 'Da thoat chat cung nguoi nay. Vui long tim cuoc tro chuyen moi.'
              : 'Chua co tin nhan nao. Vui long tim cuoc tro chuyen moi.'
          }
        >
          <Button type="primary" onClick={() => navigate('/chat/tim-kiem')}>
            Tim cuoc tro chuyen moi
          </Button>
        </Empty>
      </div>
    )
  }

  return (
    <Layout style={{ height: '100%', background: '#ffffff' }}>
      <Header style={{ padding: 0, height: 76, lineHeight: '76px', background: '#ffffff' }}>
        <ChatHeader user={participant} />
      </Header>
      <Content style={{ minHeight: 0 }}>
        <MessageList messages={isLoadingHistory ? [] : messages} currentUserId={currentUserId} />
      </Content>
      <Footer style={{ padding: 0, background: '#ffffff' }}>
        <ChatInput onSend={handleSendMessage} onExitConversation={handleExitConversation} />
      </Footer>
    </Layout>
  )
}
