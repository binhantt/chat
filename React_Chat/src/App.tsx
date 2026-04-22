import { Routes, Route, Navigate } from 'react-router-dom'

// pages
import LoginPage from './features/auth/pages/LoginPage'
import ChatPage from './features/chat/pages/ChatPage'
import ConversationPage from './features/chat/pages/ConversationPage'
import FeedbackPage from './features/chat/pages/FeedbackPage'
import SettingsPage from './features/chat/pages/SettingsPage'
import SearchPage from './features/chat/pages/SearchPage'
import ProtectedRoute from './features/auth/components/ProtectedRoute'

export default function App() {
  return (
    <Routes >
      {/* default redirect */}
      <Route path="/" element={<Navigate to="/chat/tro-chuyen" />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="tro-chuyen" replace />} />
        <Route path="tro-chuyen" element={<ConversationPage />} />
        <Route path="tro-chuyen/:roomId" element={<ConversationPage />} />
        <Route path="phan-anh" element={<FeedbackPage />} />
        <Route path="cai-dat" element={<SettingsPage />} />
        <Route path="tim-kiem" element={<SearchPage />} />
      </Route>

      {/* auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* fallback */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  )
}
