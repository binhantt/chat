import { App as AntdApp, Button, Card, Form, Input, List, Space, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useCurrentUser } from '../../auth/hooks/useAuth'
import { chatTheme } from '../chatTheme'
import feedbackService, { type FeedbackItem } from '../services/feedback.service'

interface FeedbackFormValues {
  title: string
  content: string
}

export default function FeedbackPage() {
  const { message: messageApi } = AntdApp.useApp()
  const currentUser = useCurrentUser()
  const [form] = Form.useForm<FeedbackFormValues>()
  const [submitting, setSubmitting] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])

  const loadFeedbacks = async () => {
    try {
      setLoadingHistory(true)
      const items = await feedbackService.getMine()
      setFeedbacks(items)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ?? 'Không đọc được phản hồi đã lưu.'
      messageApi.error(errorMessage)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    void loadFeedbacks()
  }, [])

  const handleSubmit = async (values: FeedbackFormValues) => {
    try {
      setSubmitting(true)
      const created = await feedbackService.create({
        title: values.title,
        content: values.content,
      })
      setFeedbacks((current) => [created, ...current])
      messageApi.success('Đã gửi phản hồi thành công')
      form.resetFields()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ?? 'Không gửi được phản hồi. Vui lòng thử lại.'
      messageApi.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        padding: 24,
        background:
          'linear-gradient(180deg, rgba(10, 16, 28, 0.96) 0%, rgba(15, 23, 42, 0.94) 100%)',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <Card
        style={{
          width: '100%',
          borderRadius: 24,
          borderColor: 'rgba(148,163,184,0.16)',
          background: 'rgba(17, 24, 39, 0.88)',
          boxShadow: chatTheme.shadow,
          color: chatTheme.text,
        }}
      >
        <Typography.Title level={3} style={{ marginTop: 0, color: chatTheme.textStrong }}>
          Phản hồi
        </Typography.Title>
        <Typography.Text style={{ color: chatTheme.textMuted }}>
          Gửi ý kiến hoặc báo lỗi để hệ thống hỗ trợ bạn nhanh hơn.
        </Typography.Text>
        <Space direction="vertical" size={6} style={{ display: 'flex', marginTop: 18 }}>
          <Tag color="blue">Người gửi: {currentUser?.displayName ?? 'Chưa xác định'}</Tag>
          <Typography.Text style={{ color: chatTheme.textMuted }}>
            Email: {currentUser?.email ?? 'Không có email'}
          </Typography.Text>
        </Space>

        <Form form={form} layout="vertical" style={{ marginTop: 20 }} onFinish={handleSubmit}>
          <Form.Item
            label={<span style={{ color: chatTheme.textStrong }}>Tiêu đề</span>}
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề phản hồi" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: chatTheme.textStrong }}>Nội dung</span>}
            name="content"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea rows={6} placeholder="Mô tả vấn đề của bạn..." />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            style={{ boxShadow: '0 14px 28px rgba(59,130,246,0.26)' }}
          >
            Gửi phản hồi
          </Button>
        </Form>

        <div style={{ marginTop: 28 }}>
          <Typography.Title level={4} style={{ color: chatTheme.textStrong, marginBottom: 12 }}>
            Phản hồi đã lưu
          </Typography.Title>
          <List
            loading={loadingHistory}
            dataSource={feedbacks}
            locale={{ emptyText: 'Chưa có phản hồi nào được lưu.' }}
            renderItem={(item) => (
              <List.Item
                style={{
                  borderBlockEnd: '1px solid rgba(148,163,184,0.14)',
                  paddingInline: 0,
                }}
              >
                <List.Item.Meta
                  title={
                    <Space size={8} wrap>
                      <span style={{ color: chatTheme.textStrong }}>{item.title}</span>
                      <Tag color="geekblue">{item.user?.displayName ?? currentUser?.displayName ?? 'Bạn'}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={6} style={{ display: 'flex' }}>
                      <Typography.Text style={{ color: chatTheme.textMuted }}>
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </Typography.Text>
                      <Typography.Paragraph style={{ color: chatTheme.text, marginBottom: 0 }}>
                        {item.content}
                      </Typography.Paragraph>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Card>
    </div>
  )
}
