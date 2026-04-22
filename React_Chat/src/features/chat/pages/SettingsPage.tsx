import {
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  List,
  Select,
  Space,
  Switch,
  Typography,
  message,
} from 'antd'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../auth/store/auth.store'
import profileService from '../services/profile.service'

interface ProfileFormValues {
  fullName: string
  birthDate: string
  gmail: string
  joinedAt: string
  gender: string
}

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const [form] = Form.useForm<ProfileFormValues>()
  const [notifyMessage, setNotifyMessage] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [showOnline, setShowOnline] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profile, setProfile] = useState<ProfileFormValues>({
    fullName: user?.displayName ?? 'Chua cap nhat',
    birthDate: String(user?.attributes?.birthDate ?? ''),
    gmail: user?.email ?? String(user?.attributes?.gmail ?? ''),
    joinedAt: String(
      user?.attributes?.joinedAt ??
        user?.attributes?.joinDate ??
        user?.attributes?.createdAt ??
        '',
    ),
    gender: String(user?.attributes?.gender ?? ''),
  })

  useEffect(() => {
    setProfile({
      fullName: user?.displayName ?? 'Chua cap nhat',
      birthDate: String(user?.attributes?.birthDate ?? ''),
      gmail: user?.email ?? String(user?.attributes?.gmail ?? ''),
      joinedAt: String(
        user?.attributes?.joinedAt ??
          user?.attributes?.joinDate ??
          user?.attributes?.createdAt ??
          '',
      ),
      gender: String(user?.attributes?.gender ?? ''),
    })
  }, [user])

  const fallbackText = (value: string) => (value.trim() ? value : 'Chua cap nhat')

  const handleStartEdit = () => {
    form.setFieldsValue(profile)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveProfile = async (values: ProfileFormValues) => {
    const nextAttributes: Record<string, string | number | boolean> = {
      ...(user?.attributes ?? {}),
      birthDate: values.birthDate || '',
      gender: values.gender || '',
      joinedAt: values.joinedAt || '',
      gmail: values.gmail || '',
    }

    try {
      setIsSavingProfile(true)
      const responseUser = await profileService.updateProfile({
        displayName: values.fullName,
        email: values.gmail || undefined,
        attributes: nextAttributes,
      })

      const nextUser = responseUser ??
        (user
          ? {
              ...user,
              displayName: values.fullName,
              email: values.gmail || user.email,
              attributes: nextAttributes,
            }
          : null)

      if (nextUser) {
        useAuthStore.setState(() => ({
          user: nextUser,
        }))
      }

      setProfile(values)
      setIsEditing(false)
      message.success('Da cap nhat thong tin ca nhan')
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ??
        error?.message ??
        'Khong the cap nhat thong tin. Vui long thu lai.'
      message.error(errorMessage)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const genderLabel =
    {
      nam: 'Nam',
      nu: 'Nu',
      khac: 'Khac',
    }[profile.gender] ?? fallbackText(profile.gender)

  const descriptionItems = [
    {
      key: 'name',
      label: 'Ho va ten',
      children: fallbackText(profile.fullName),
    },
    {
      key: 'birthDate',
      label: 'Ngay sinh',
      children: fallbackText(profile.birthDate),
    },
    {
      key: 'gmail',
      label: 'Dia chi Gmail',
      children: fallbackText(profile.gmail),
    },
    {
      key: 'gender',
      label: 'Gioi tinh',
      children: genderLabel,
    },
    {
      key: 'joinDate',
      label: 'Ngay gia nhap',
      children: fallbackText(profile.joinedAt),
    },
  ]

  return (
    <div style={{ padding: 24, background: '#ffffff', height: '100%', overflowY: 'auto' }}>
      <Card style={{ width: '100%' }}>
        <Typography.Title level={3} style={{ marginTop: 0, color: '#001529' }}>
          Cai dat
        </Typography.Title>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Typography.Title level={5} style={{ margin: 0, color: '#001529' }}>
            Thong tin ca nhan
          </Typography.Title>

          {!isEditing && (
            <Button type="primary" onClick={handleStartEdit}>
              Chinh sua
            </Button>
          )}
        </div>

        {isEditing ? (
          <Form
            layout="vertical"
            form={form}
            initialValues={profile}
            onFinish={handleSaveProfile}
          >
            <Form.Item label="Ho va ten" name="fullName" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Ngay sinh" name="birthDate">
              <Input placeholder="dd/mm/yyyy" />
            </Form.Item>
            <Form.Item label="Dia chi Gmail" name="gmail" rules={[{ type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Gioi tinh" name="gender">
              <Select
                allowClear
                options={[
                  { label: 'Nam', value: 'nam' },
                  { label: 'Nu', value: 'nu' },
                  { label: 'Khac', value: 'khac' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Ngay gia nhap" name="joinedAt">
              <Input placeholder="dd/mm/yyyy" />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSavingProfile}>
                Luu
              </Button>
              <Button onClick={handleCancelEdit} disabled={isSavingProfile}>
                Huy
              </Button>
            </Space>
          </Form>
        ) : (
          <Descriptions
            size="small"
            column={1}
            bordered
            items={descriptionItems}
            style={{ marginBottom: 18 }}
          />
        )}

        <Divider style={{ margin: '16px 0' }} />
        <Typography.Title level={5} style={{ marginTop: 0, color: '#001529' }}>
          Tuy chinh thong bao
        </Typography.Title>
        <List
          split
          dataSource={[
            {
              key: 'message',
              title: 'Thong bao tin nhan',
              value: notifyMessage,
              onChange: setNotifyMessage,
            },
            {
              key: 'email',
              title: 'Thong bao qua email',
              value: notifyEmail,
              onChange: setNotifyEmail,
            },
            {
              key: 'online',
              title: 'Hien trang thai online',
              value: showOnline,
              onChange: setShowOnline,
            },
          ]}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Switch key={item.key} checked={item.value} onChange={item.onChange} />,
              ]}
            >
              <Typography.Text style={{ color: '#001529' }}>{item.title}</Typography.Text>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
