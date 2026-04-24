import { ConfigProvider, theme as antdTheme } from 'antd'
import ChatLayout from '../components/ChatLayout'
import { chatTheme } from '../chatTheme'

export default function ChatPage() {
  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        token: {
          colorPrimary: chatTheme.accentStrong,
          colorInfo: chatTheme.accentStrong,
          colorBgBase: '#0a1220',
          colorBgContainer: '#111a2b',
          colorBgElevated: '#131d31',
          colorBorder: 'rgba(148, 163, 184, 0.18)',
          colorTextBase: '#e2e8f0',
          borderRadius: 16,
          fontFamily:
            'Inter, "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        },
        components: {
          Layout: {
            bodyBg: 'transparent',
            headerBg: 'transparent',
            siderBg: 'transparent',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(96, 165, 250, 0.18)',
            darkItemHoverBg: 'rgba(148, 163, 184, 0.14)',
            darkItemColor: 'rgba(226, 232, 240, 0.78)',
            darkItemSelectedColor: '#ffffff',
          },
        },
      }}
    >
      <ChatLayout />
    </ConfigProvider>
  )
}
