import { App as AntdApp, Layout } from 'antd'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useAuthStore } from '../../auth/store/auth.store'
import { API_ENDPOINTS, APP_CONFIG } from '../../../shared/constants/config'
import type { ChatLayoutOutletContext } from '../components/ChatLayout'
import ChatHeader from '../components/ChatHeader'
import ChatInput from '../components/ChatInput'
import MessageList from '../components/MessageList'
import chatService, { type ChatSearchUser } from '../services/chat.service'
import type { ChatMessage, ChatRoomSummary, ChatUser } from '../types/chat.types'
import { chatTheme } from '../chatTheme'

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
  metadata?: {
    kind?: string
    roomId?: string
    partner?: ChatSearchUser
    messageId?: string
  }
}

const toChatStatus = (value?: string): ChatUser['status'] => {
  const normalized = String(value ?? '').toLowerCase()
  if (normalized === 'online') return 'Online'
  if (normalized === 'away') return 'Away'
  return 'Offline'
}

const toChatUser = (partner?: ChatSearchUser): ChatUser => ({
  id: partner?.id ?? 'unknown',
  name: partner?.name ?? 'Đối tác mới',
  avatar: partner?.avatar ?? '',
  status: toChatStatus(partner?.status),
  isAnonymous: partner?.isAnonymous ?? false,
})

const noopSetHideSidebar = (_hidden: boolean) => {}

export default function ConversationPage() {
  const { message: messageApi } = AntdApp.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const { roomId } = useParams<{ roomId?: string }>()
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = currentUser?.id ?? 'u-me'
  const outletContext = useOutletContext<ChatLayoutOutletContext | undefined>()
  const setHideSidebar = outletContext?.setHideSidebar ?? noopSetHideSidebar
  const [messagesByConversation, setMessagesByConversation] =
    useState<Record<string, ChatMessage[]>>({})
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isLoadingRoom, setIsLoadingRoom] = useState(false)
  const [isLikingRoom, setIsLikingRoom] = useState(false)
  const [isExitedConversation, setIsExitedConversation] = useState(false)
  const [roomSummary, setRoomSummary] = useState<ChatRoomSummary | null>(null)

  const activeRoomId = roomId ?? null
  const locationState = location.state as ConversationLocationState | null
  const fallbackParticipant = useMemo(
    () => toChatUser(locationState?.participant),
    [locationState?.participant]
  )
  const participant = roomSummary?.partner ?? fallbackParticipant
  const currentUserName = currentUser?.displayName ?? 'Bạn'

  const messages = useMemo(
    () => (activeRoomId ? messagesByConversation[activeRoomId] ?? [] : []),
    [activeRoomId, messagesByConversation]
  )

  useEffect(() => {
    if (!activeRoomId) return

    let cancelled = false

    const loadRoomSummary = async () => {
      try {
        setRoomSummary(null)
        setIsLoadingRoom(true)
        const room = await chatService.getRoomSummary(activeRoomId)
        if (cancelled) return
        setRoomSummary(room)
      } catch (error) {
        if (cancelled) return
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/login', { replace: true })
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRoom(false)
        }
      }
    }

    void loadRoomSummary()

    return () => {
      cancelled = true
    }
  }, [activeRoomId, navigate])

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
            messageApi.error('Không kết nối được server chat. Vui lòng thử lại sau.')
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

    const syncRoomSummary = async () => {
      try {
        const room = await chatService.getRoomSummary(activeRoomId)
        if (isClosed) return
        setRoomSummary(room)
      } catch {
        return
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

    const streamBaseUrl = `${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS.STREAM}`
    const eventSource = new EventSource(streamBaseUrl, { withCredentials: true })

    const handleNotification = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as RealtimeNotification
        if (data.roomId !== activeRoomId) return

        if (data.type === 'SYSTEM' && data.metadata?.kind === 'ROOM_IDENTITY_REVEALED') {
          void syncRoomSummary()
          messageApi.success('Tên của cả hai đã được mở để bắt đầu tìm hiểu.')
          return
        }

        if (data.type !== 'MESSAGE') return
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
    setHideSidebar(false)
  }, [setHideSidebar, activeRoomId])

  useEffect(() => {
    if (!activeRoomId && !isExitedConversation) {
      navigate('/chat/tim-kiem', { replace: true })
    }
  }, [activeRoomId, isExitedConversation, navigate])

  const handleLikePartner = async () => {
    if (!activeRoomId) return

    try {
      setIsLikingRoom(true)
      const room = await chatService.likeRoom(activeRoomId)
      if (room) {
        setRoomSummary(room)
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ?? 'Không thể mở tên lúc này. Vui lòng thử lại.'
      messageApi.error(errorMessage)
    } finally {
      setIsLikingRoom(false)
    }
  }

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
      messageApi.warning('Không gửi được lên server, đã lưu tạm trên giao diện.')
    }
  }

  const handleExitConversation = () => {
    if (!activeRoomId) return

    setIsExitedConversation(true)

    void (async () => {
      try {
        await chatService.leaveRoom(activeRoomId)
      } catch {
        messageApi.warning('Không thể đồng bộ trạng thái rời cuộc trò chuyện.')
      } finally {
        navigate('/chat/tim-kiem', { replace: true })
      }
    })()
  }

  if (!activeRoomId) return null

  return (
    <Layout
      style={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background:
          'linear-gradient(180deg, rgba(10, 16, 28, 0.98) 0%, rgba(12, 18, 32, 0.94) 100%)',
      }}
    >
      <Header
        style={{
          padding: 0,
          height: 76,
          lineHeight: '76px',
          background: 'transparent',
          flex: '0 0 auto',
        }}
      >
        <ChatHeader
          user={participant}
          identityRevealed={roomSummary?.identityRevealed ?? !participant.isAnonymous}
          currentUserLiked={roomSummary?.currentUserLiked ?? false}
          partnerLiked={roomSummary?.partnerLiked ?? false}
          onLike={handleLikePartner}
          likeLoading={isLikingRoom || isLoadingRoom}
        />
      </Header>
      <Content
        style={{
          minHeight: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: chatTheme.shellBg,
        }}
      >
        <MessageList
          messages={isLoadingHistory ? [] : messages}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          partner={participant}
        />
      </Content>
      <Footer
        style={{
          padding: 0,
          background: 'transparent',
          flex: '0 0 auto',
        }}
      >
        <ChatInput onSend={handleSendMessage} onExitConversation={handleExitConversation} />
      </Footer>
    </Layout>
  )
}
