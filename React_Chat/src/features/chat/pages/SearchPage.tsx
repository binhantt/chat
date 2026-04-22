import { Button, Card, Space, Spin, Typography, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import chatService, { type MatchSearchResponse } from '../services/chat.service'

const POLL_INTERVAL_MS = 2500

type SearchStatus = 'idle' | 'searching'

export default function SearchPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [queueSize, setQueueSize] = useState(0)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const pollInFlightRef = useRef(false)

  const stopPolling = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleMatched = (result: Extract<MatchSearchResponse, { status: 'matched' }>) => {
    stopPolling()
    setStatus('idle')
    setQueueSize(0)
    message.success('Da tim thay doi tac tro chuyen moi.')
    navigate(`/chat/tro-chuyen/${result.roomId}`, {
      replace: true,
      state: { participant: result.partner },
    })
  }

  const requestMatch = async (): Promise<MatchSearchResponse | null> => {
    if (pollInFlightRef.current) return null

    pollInFlightRef.current = true
    try {
      const result = await chatService.searchMatch()
      if (result.status === 'matched') {
        handleMatched(result)
        return result
      }

      setStatus('searching')
      setQueueSize(result.queueSize)
      return result
    } catch (error: any) {
      stopPolling()
      setStatus('idle')
      setQueueSize(0)
      const errorMessage =
        error?.response?.data?.message ?? 'Khong the tim cuoc tro chuyen luc nay.'
      message.error(errorMessage)
      return null
    } finally {
      pollInFlightRef.current = false
    }
  }

  const handleStartSearch = async () => {
    if (status === 'searching' || loading) return

    setLoading(true)
    const result = await requestMatch()
    setLoading(false)

    if (result?.status === 'waiting' && intervalRef.current === null) {
      intervalRef.current = window.setInterval(() => {
        void requestMatch()
      }, POLL_INTERVAL_MS)
    }
  }

  const handleCancelSearch = async () => {
    stopPolling()
    setStatus('idle')
    setQueueSize(0)
    setLoading(false)
    try {
      await chatService.cancelMatchSearch()
    } catch {
      return
    }
  }

  useEffect(() => {
    return () => {
      const shouldCancelQueue = intervalRef.current !== null
      stopPolling()
      if (shouldCancelQueue) {
        void chatService.cancelMatchSearch()
      }
    }
  }, [])

  return (
    <div
      style={{
        height: '100%',
        padding: 24,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        style={{
          width: 'min(560px, 100%)',
          borderRadius: 16,
          borderColor: 'rgba(22,119,255,0.2)',
        }}
      >
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Typography.Title level={3} style={{ margin: 0, color: '#001529' }}>
            Tim cuoc tro chuyen moi
          </Typography.Title>

          <Typography.Text style={{ color: 'rgba(0,21,41,0.72)' }}>
            Nhan nut tim kiem de vao hang doi. He thong se ghep 2 nguoi vao mot phong chat rieng tu.
          </Typography.Text>

          {status === 'searching' && (
            <Space align="center" size={12}>
              <Spin size="small" />
              <Typography.Text style={{ color: '#001529' }}>
                Dang cho ghep cap... Hang doi hien tai: {queueSize}
              </Typography.Text>
            </Space>
          )}

          <Space>
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={() => void handleStartSearch()}
            >
              Tim kiem
            </Button>
            {status === 'searching' && (
              <Button size="large" onClick={() => void handleCancelSearch()}>
                Huy tim kiem
              </Button>
            )}
          </Space>
        </Space>
      </Card>
    </div>
  )
}
