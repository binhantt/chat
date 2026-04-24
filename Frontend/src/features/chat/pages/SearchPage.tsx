import { App as AntdApp, Button, Card, Empty, Input, List, Space, Spin, Tag, Typography } from 'antd'
import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import chatService, { type ChatSearchUser, type MatchSearchResponse } from '../services/chat.service'
import { chatTheme } from '../chatTheme'

const POLL_INTERVAL_MS = 2500

type SearchStatus = 'idle' | 'searching'

const genderLabelMap: Record<string, string> = {
  nam: 'Nam',
  nu: 'Nữ',
  khac: 'Khác',
}

export default function SearchPage() {
  const { message: messageApi } = AntdApp.useApp()
  const navigate = useNavigate()
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [queueSize, setQueueSize] = useState(0)
  const [loading, setLoading] = useState(false)
  const [userKeyword, setUserKeyword] = useState('')
  const [users, setUsers] = useState<ChatSearchUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const intervalRef = useRef<number | null>(null)
  const pollInFlightRef = useRef(false)
  const deferredKeyword = useDeferredValue(userKeyword)

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
    messageApi.success('Đã tìm thấy đối tác trò chuyện mới.')
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
        error?.response?.data?.message ?? 'Không thể tìm cuộc trò chuyện lúc này.'
      messageApi.error(errorMessage)
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

  useEffect(() => {
    let cancelled = false

    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true)
        const response = await chatService.searchUsers(deferredKeyword.trim())
        if (cancelled) return
        setUsers(response)
      } catch (error: any) {
        if (cancelled) return
        setUsers([])
        const errorMessage =
          error?.response?.data?.message ?? 'Không tải được danh sách người dùng.'
        messageApi.error(errorMessage)
      } finally {
        if (!cancelled) {
          setIsLoadingUsers(false)
        }
      }
    }

    void loadUsers()

    return () => {
      cancelled = true
    }
  }, [deferredKeyword])

  return (
    <div
      style={{
        minHeight: '100%',
        padding: 24,
        background:
          'linear-gradient(180deg, rgba(10, 16, 28, 0.96) 0%, rgba(15, 23, 42, 0.94) 100%)',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'auto',
      }}
    >
      <Space direction="vertical" size={20} style={{ width: 'min(960px, 100%)' }}>
        <Card
          style={{
            borderRadius: 24,
            borderColor: 'rgba(148,163,184,0.16)',
            background: 'rgba(17, 24, 39, 0.88)',
            boxShadow: chatTheme.shadow,
            color: chatTheme.text,
          }}
        >
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <Typography.Title level={3} style={{ margin: 0, color: chatTheme.textStrong }}>
              Tìm cuộc trò chuyện mới
            </Typography.Title>

            <Typography.Text style={{ color: chatTheme.textMuted }}>
              Nhấn tìm kiếm để vào hàng đợi. Hệ thống sẽ ghép 2 người vào một phòng chat riêng tư.
            </Typography.Text>

            {status === 'searching' && (
              <Space align="center" size={12}>
                <Spin size="small" />
                <Typography.Text style={{ color: chatTheme.textStrong }}>
                  Đang chờ ghép cặp... Hàng đợi hiện tại: {queueSize}
                </Typography.Text>
              </Space>
            )}

            <Space>
              <Button
                type="primary"
                size="large"
                loading={loading}
                onClick={() => void handleStartSearch()}
                style={{ boxShadow: '0 14px 28px rgba(59,130,246,0.26)' }}
              >
                Tìm kiếm
              </Button>
              {status === 'searching' && (
                <Button
                  size="large"
                  onClick={() => void handleCancelSearch()}
                  style={{
                    borderColor: 'rgba(148,163,184,0.2)',
                    background: 'rgba(255,255,255,0.04)',
                    color: chatTheme.textStrong,
                  }}
                >
                  Hủy tìm kiếm
                </Button>
              )}
            </Space>
          </Space>
        </Card>

        <Card
          style={{
            borderRadius: 24,
            borderColor: 'rgba(148,163,184,0.16)',
            background: 'rgba(17, 24, 39, 0.88)',
            boxShadow: chatTheme.shadow,
          }}
        >
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <div>
              <Typography.Title level={4} style={{ margin: 0, color: chatTheme.textStrong }}>
                Danh sách users
              </Typography.Title>
              <Typography.Text style={{ color: chatTheme.textMuted }}>
                Xem nhanh người dùng hiện có cùng giới tính và ngày sinh đã khai báo.
              </Typography.Text>
            </div>

            <Input.Search
              allowClear
              placeholder="Tìm theo tên hoặc email"
              value={userKeyword}
              onChange={(event) => setUserKeyword(event.target.value)}
            />

            <Spin spinning={isLoadingUsers}>
              {users.length === 0 ? (
                <Empty
                  description={
                    <Typography.Text style={{ color: chatTheme.textMuted }}>
                      Không tìm thấy người dùng phù hợp.
                    </Typography.Text>
                  }
                />
              ) : (
                <List
                  dataSource={users}
                  renderItem={(user) => {
                    const genderLabel = user.gender ? genderLabelMap[user.gender] ?? user.gender : 'Chưa cập nhật'
                    const birthDate = user.birthDate || 'Chưa cập nhật'
                    const statusLabel = user.status || 'Offline'
                    const isOnline = statusLabel.toLowerCase() === 'online'

                    return (
                      <List.Item
                        style={{
                          paddingInline: 0,
                          borderBlockEnd: '1px solid rgba(148,163,184,0.12)',
                        }}
                      >
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <Space
                            align="center"
                            style={{
                              width: '100%',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              rowGap: 8,
                            }}
                          >
                            <div>
                              <Typography.Text
                                style={{ display: 'block', color: chatTheme.textStrong, fontWeight: 700 }}
                              >
                                {user.name}
                              </Typography.Text>
                              <Typography.Text style={{ color: chatTheme.textMuted }}>
                                {user.email || 'Chưa có email'}
                              </Typography.Text>
                            </div>

                            <Tag color={isOnline ? 'success' : 'default'}>
                              {statusLabel}
                            </Tag>
                          </Space>

                          <Space size={[8, 8]} wrap>
                            <Tag color="blue">Giới tính: {genderLabel}</Tag>
                            <Tag color="geekblue">Ngày sinh: {birthDate}</Tag>
                            {user.address ? <Tag color="cyan">Địa chỉ: {user.address}</Tag> : null}
                          </Space>
                        </Space>
                      </List.Item>
                    )
                  }}
                />
              )}
            </Spin>
          </Space>
        </Card>
      </Space>
    </div>
  )
}
