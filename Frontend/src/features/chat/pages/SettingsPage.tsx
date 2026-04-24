import {
  App as AntdApp,
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Switch,
  Typography,
} from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthStore } from '../../auth/store/auth.store'
import profileService from '../services/profile.service'
import { chatTheme } from '../chatTheme'

interface ProfileFormValues {
  fullName: string
  birthDate: string
  gmail: string
  joinedAt: string
  gender: string
}

interface NotificationSettingsValues {
  notifyMessage: boolean
  notifyEmail: boolean
  showOnline: boolean
}

const normalizeDateForInput = (value?: string | number | boolean | null): string => {
  if (!value) return ''
  const trimmed = String(value).trim()
  if (!trimmed) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/')
    return `${year}-${month}-${day}`
  }
  return trimmed
}

const resolveProfileValues = (user: ReturnType<typeof useAuthStore.getState>['user']): ProfileFormValues => ({
  fullName: user?.displayName ?? 'Chưa cập nhật',
  birthDate: normalizeDateForInput(user?.personalDetail?.birthDate ?? user?.attributes?.birthDate ?? ''),
  gmail: user?.email ?? String(user?.attributes?.gmail ?? ''),
  joinedAt: String(
    user?.attributes?.joinedAt ??
      user?.attributes?.joinDate ??
      user?.attributes?.createdAt ??
      '',
  ),
  gender: String(user?.personalDetail?.gender ?? user?.attributes?.gender ?? ''),
})

const resolveNotificationValues = (
  user: ReturnType<typeof useAuthStore.getState>['user']
): NotificationSettingsValues => ({
  notifyMessage: Boolean(user?.attributes?.notifyMessage ?? true),
  notifyEmail: Boolean(user?.attributes?.notifyEmail ?? false),
  showOnline: Boolean(user?.attributes?.showOnline ?? true),
})

export default function SettingsPage() {
  const currentUser = useAuthStore((state) => state.user)
  const [form] = Form.useForm<ProfileFormValues>()
  const [notificationForm] = Form.useForm<NotificationSettingsValues>()
  const [isEditing, setIsEditing] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const didLoadServerProfileRef = useRef(false)
  const [profile, setProfile] = useState<ProfileFormValues>(resolveProfileValues(currentUser))
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsValues>(
    resolveNotificationValues(currentUser)
  )
  const { message: messageApi } = AntdApp.useApp()

  const fallbackText = useMemo(() => (value: string) => (value.trim() ? value : 'Chưa cập nhật'), [])

  const stripLegacyPersonalDetailKeys = (
    attributes: Record<string, string | number | boolean> | undefined
  ) => {
    const nextAttributes = { ...(attributes ?? {}) }
    delete nextAttributes.gender
    delete nextAttributes.birthDate
    return nextAttributes
  }

  const getFreshProfile = async () => {
    try {
      return await profileService.getProfile()
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (didLoadServerProfileRef.current) return
    didLoadServerProfileRef.current = true

    let cancelled = false

    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true)
        const serverUser = await profileService.getProfile()
        if (cancelled || !serverUser) return

        useAuthStore.setState(() => ({
          user: serverUser,
        }))

        const nextProfile = resolveProfileValues(serverUser)
        const nextNotificationSettings = resolveNotificationValues(serverUser)
        setProfile(nextProfile)
        setNotificationSettings(nextNotificationSettings)
        form.setFieldsValue(nextProfile)
        notificationForm.setFieldsValue(nextNotificationSettings)
      } catch {
        const nextProfile = resolveProfileValues(currentUser)
        const nextNotificationSettings = resolveNotificationValues(currentUser)
        setProfile(nextProfile)
        setNotificationSettings(nextNotificationSettings)
        form.setFieldsValue(nextProfile)
        notificationForm.setFieldsValue(nextNotificationSettings)
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false)
        }
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [form, notificationForm])

  useEffect(() => {
    const nextProfile = resolveProfileValues(currentUser)
    const nextNotificationSettings = resolveNotificationValues(currentUser)
    setProfile(nextProfile)
    setNotificationSettings(nextNotificationSettings)
    form.setFieldsValue(nextProfile)
    notificationForm.setFieldsValue(nextNotificationSettings)
  }, [currentUser, form, notificationForm])

  const handleStartEdit = () => {
    form.setFieldsValue(profile)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    form.setFieldsValue(profile)
  }

  const handleSaveProfile = async (values: ProfileFormValues) => {
    const nextAttributes: Record<string, string | number | boolean> = {
      ...stripLegacyPersonalDetailKeys(currentUser?.attributes),
      joinedAt: values.joinedAt || '',
    }
    const personalDetailPayload =
      values.birthDate || values.gender
        ? {
            birthDate: values.birthDate || '',
            gender: values.gender || '',
          }
        : undefined
    const nextPersonalDetail = {
      birthDate: values.birthDate || undefined,
      gender: values.gender || undefined,
    }

    try {
      setIsSavingProfile(true)
      const responseUser = await profileService.updateProfile({
        displayName: values.fullName,
        email: values.gmail || undefined,
        attributes: nextAttributes,
        ...(personalDetailPayload ? { personalDetail: personalDetailPayload } : {}),
      })
      const freshUser = await getFreshProfile()

      const nextUser =
        freshUser ??
        responseUser ??
        (currentUser
          ? {
              ...currentUser,
              displayName: values.fullName,
              email: values.gmail || currentUser.email,
              attributes: nextAttributes,
              personalDetail: nextPersonalDetail,
            }
          : null)

      if (nextUser) {
        useAuthStore.setState(() => ({
          user: nextUser,
        }))
      }

      setProfile(values)
      setIsEditing(false)
      messageApi.success('Đã cập nhật thông tin cá nhân')
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ??
        error?.message ??
        'Không thể cập nhật thông tin. Vui lòng thử lại.'
      messageApi.error(errorMessage)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSaveNotificationSettings = async (values: NotificationSettingsValues) => {
    const nextAttributes: Record<string, string | number | boolean> = {
      ...stripLegacyPersonalDetailKeys(currentUser?.attributes),
      notifyMessage: values.notifyMessage,
      notifyEmail: values.notifyEmail,
      showOnline: values.showOnline,
    }

    try {
      setIsSavingNotifications(true)
      const responseUser = await profileService.updateProfile({
        attributes: nextAttributes,
      })
      const freshUser = await getFreshProfile()

      const nextUser =
        freshUser ??
        responseUser ??
        (currentUser
          ? {
              ...currentUser,
              attributes: nextAttributes,
            }
          : null)

      if (nextUser) {
        useAuthStore.setState(() => ({
          user: nextUser,
        }))
      }

      setNotificationSettings(values)
      messageApi.success('Đã lưu tùy chỉnh thông báo')
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ??
        error?.message ??
        'Không thể lưu tùy chỉnh thông báo. Vui lòng thử lại.'
      messageApi.error(errorMessage)
    } finally {
      setIsSavingNotifications(false)
    }
  }

  const genderLabel =
    {
      nam: 'Nam',
      nu: 'Nữ',
      khac: 'Khác',
    }[profile.gender] ?? fallbackText(profile.gender)

  const descriptionItems = [
    { key: 'name', label: 'Họ và tên', children: fallbackText(profile.fullName) },
    { key: 'birthDate', label: 'Ngày sinh', children: fallbackText(profile.birthDate) },
    { key: 'gmail', label: 'Địa chỉ Gmail', children: fallbackText(profile.gmail) },
    { key: 'gender', label: 'Giới tính', children: genderLabel },
    { key: 'joinDate', label: 'Ngày gia nhập', children: fallbackText(profile.joinedAt) },
  ]

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
      <Spin spinning={isLoadingProfile}>
        <Card
          style={{
            width: '100%',
            borderRadius: 24,
            borderColor: 'rgba(148,163,184,0.16)',
            background: 'rgba(17, 24, 39, 0.88)',
            boxShadow: chatTheme.shadow,
          }}
        >
          <Typography.Title level={3} style={{ marginTop: 0, color: chatTheme.textStrong }}>
            Cài đặt
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
            <Typography.Title level={5} style={{ margin: 0, color: chatTheme.textStrong }}>
              Thông tin cá nhân
            </Typography.Title>

            {!isEditing && (
              <Button type="primary" onClick={handleStartEdit}>
                Chỉnh sửa
              </Button>
            )}
          </div>

          {isEditing ? (
            <Form layout="vertical" form={form} initialValues={profile} onFinish={handleSaveProfile}>
              <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Ngày sinh" name="birthDate">
                <Input type="date" />
              </Form.Item>
              <Form.Item label="Địa chỉ Gmail" name="gmail" rules={[{ type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Giới tính" name="gender">
                <Select
                  allowClear
                  options={[
                    { label: 'Nam', value: 'nam' },
                    { label: 'Nữ', value: 'nu' },
                    { label: 'Khác', value: 'khac' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Ngày gia nhập" name="joinedAt">
                <Input placeholder="dd/mm/yyyy" />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={isSavingProfile}>
                  Lưu
                </Button>
                <Button onClick={handleCancelEdit} disabled={isSavingProfile}>
                  Hủy
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

          <Divider style={{ margin: '16px 0', borderColor: 'rgba(148,163,184,0.14)' }} />

          <Typography.Title level={5} style={{ marginTop: 0, color: chatTheme.textStrong }}>
            Tùy chỉnh thông báo
          </Typography.Title>

          <Form
            layout="vertical"
            form={notificationForm}
            initialValues={notificationSettings}
            onFinish={handleSaveNotificationSettings}
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Typography.Text style={{ color: chatTheme.textStrong }}>
                  Thông báo tin nhắn
                </Typography.Text>
                <Form.Item name="notifyMessage" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Typography.Text style={{ color: chatTheme.textStrong }}>
                  Thông báo qua email
                </Typography.Text>
                <Form.Item name="notifyEmail" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Typography.Text style={{ color: chatTheme.textStrong }}>
                  Hiện trạng thái online
                </Typography.Text>
                <Form.Item name="showOnline" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
            </Space>

            <Space style={{ marginTop: 16 }}>
              <Button type="primary" htmlType="submit" loading={isSavingNotifications}>
                Lưu tùy chỉnh
              </Button>
            </Space>
          </Form>
        </Card>
      </Spin>
    </div>
  )
}
