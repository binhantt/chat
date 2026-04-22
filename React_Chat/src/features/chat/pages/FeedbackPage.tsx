import { Button, Card, Form, Input, Typography, message } from 'antd'
import { useState } from 'react'
import chatService from '../services/chat.service'

interface FeedbackFormValues {
  title: string
  content: string
}

export default function FeedbackPage() {
  const [form] = Form.useForm<FeedbackFormValues>()
  const [submitting, setSubmitting] = useState(false)
  const feedbackRoomId = import.meta.env.VITE_FEEDBACK_ROOM_ID || 'feedback-room'

  const handleSubmit = async (values: FeedbackFormValues) => {
    try {
      setSubmitting(true)
      await chatService.sendMessage({
        roomId: feedbackRoomId,
        content: `[PHAN_ANH] ${values.title}\n${values.content}`,
      })
      message.success('Da gui phan anh thanh cong')
      form.resetFields()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ?? 'Khong gui duoc phan anh. Vui long thu lai.'
      message.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: 24, background: '#ffffff', height: '100%', overflowY: 'auto' }}>
      <Card style={{ width: '100%' }}>
        <Typography.Title level={3} style={{ marginTop: 0, color: '#001529' }}>
          Phan anh
        </Typography.Title>
        <Typography.Text style={{ color: 'rgba(0,21,41,0.7)' }}>
          Gui y kien hoac bao cao van de de he thong ho tro nhanh hon.
        </Typography.Text>

        <Form form={form} layout="vertical" style={{ marginTop: 20 }} onFinish={handleSubmit}>
          <Form.Item label="Tieu de" name="title" rules={[{ required: true }]}>
            <Input placeholder="Nhap tieu de phan anh" />
          </Form.Item>
          <Form.Item label="Noi dung" name="content" rules={[{ required: true }]}>
            <Input.TextArea rows={6} placeholder="Mo ta van de cua ban..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Gui phan anh
          </Button>
        </Form>
      </Card>
    </div>
  )
}
