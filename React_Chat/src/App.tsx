import { Routes, Route, Navigate } from 'react-router-dom'

// pages
import LoginPage from './features/auth/pages/LoginPage'
// (sau này có thể thêm ChatPage)

export default function App() {
  return (
    <Routes>
      {/* default redirect */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* fallback */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  )
}