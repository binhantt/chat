import { ConfigProvider } from 'antd'
import ChatLayout from '../components/ChatLayout'

export default function ChatPage() {
  return (
    <ConfigProvider 
    
      theme={{
        token: {
          colorPrimary: '#1677ff',
          colorBgBase: '#ffffff',
          colorTextBase: '#001529',
          borderRadius: 12,
        
        },
      }}
    >
      <ChatLayout />
    </ConfigProvider>
  )
}
