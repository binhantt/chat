# React Chat Login Feature - Setup Guide

## 📁 Project Structure

```
src/
├── features/
│   └── auth/
│       ├── components/
│       │   ├── LoginForm.jsx         # Login form component with email/password & Google
│       │   └── LoginForm.css         # Styling for login form
│       ├── pages/
│       │   ├── LoginPage.jsx         # Login page wrapper
│       │   └── LoginPage.css         # Styling for login page
│       ├── services/
│       │   └── auth.service.js       # API calls for authentication
│       ├── store/
│       │   └── auth.store.js         # Zustand state management
│       └── types/
│           └── auth.type.js          # TypeScript/JSDoc types
├── shared/
│   ├── api/
│   │   └── axiosClient.js            # Configured Axios instance
│   └── components/                   # Shared UI components
├── App.jsx                           # Main app with routing
├── main.jsx                          # React entry point
├── index.css                         # Global styles
└── App.css                           # App styles
```

## 🚀 Installation

### 1. Install Dependencies

```bash
cd d:\chat\React_Chat
pnpm install
```

Or if using npm:
```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the project root:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Google OAuth - Get from https://console.cloud.google.com/
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE

# Environment
VITE_ENV=development
```

### 3. Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:3000`
6. Copy the Client ID to `.env.local`

## 📦 Key Features

### ✅ Authentication Store (Zustand)

- **Persistent storage**: Automatically saves token and user to localStorage
- **State management**: `user`, `accessToken`, `isLoading`, `error`
- **Methods**:
  - `login(email, password)` - Email/password login
  - `loginWithGoogle(credential)` - Google OAuth login
  - `logout()` - Clear auth state
  - `clearError()` - Clear error messages

### ✅ API Service

- **Axios instance**: Pre-configured with base URL and interceptors
- **Request interceptor**: Auto-adds Bearer token to headers
- **Response interceptor**: Redirects to login on 401 errors
- **Methods**:
  - `login(email, password)` - POST /auth/login
  - `loginWithGoogle(credential)` - POST /auth/google
  - `logout()` - POST /auth/logout
  - `refreshToken()` - POST /auth/refresh

### ✅ Login Form Component

- **Email validation**: Required, valid email format
- **Password validation**: Required, minimum 6 characters
- **Loading state**: Spinner and disabled button while processing
- **Error display**: Alert message with close button
- **Google Sign-In**: Google Identity Services integration
- **Responsive**: Works on mobile, tablet, desktop

### ✅ Login Page

- **Centered layout**: Beautiful gradient background
- **Protected routing**: Auto-redirects if already logged in
- **Mobile responsive**: Adapts to all screen sizes

### ✅ Protected Routes

```jsx
<ProtectedRoute>
  <ChatPage />
</ProtectedRoute>
```

Automatically redirects to login if not authenticated.

## 🔌 API Endpoints

### Login with Email/Password
```
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "trustScore": 50,
    "attributes": {}
  }
}
```

### Login with Google
```
POST /auth/google
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjJjN..."
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user456",
    "email": "user@gmail.com",
    "displayName": "Jane Doe",
    "trustScore": 50,
    "attributes": {
      "authProvider": "google",
      "pictureUrl": "https://..."
    }
  }
}
```

### Logout
```
POST /auth/logout

Response: 204 No Content
```

### Refresh Token
```
POST /auth/refresh

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 🎯 Usage Examples

### Login Programmatically

```jsx
import { useAuthStore } from './features/auth/store/auth.store';

function MyComponent() {
  const { login, loginWithGoogle, user, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // User is now logged in
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div>
      {user && <p>Welcome, {user.displayName}</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleLogin} disabled={isLoading}>
        Login
      </button>
    </div>
  );
}
```

### Access Auth State

```jsx
import { useAuthStore } from './features/auth/store/auth.store';

function ChatPage() {
  const { user, accessToken, logout } = useAuthStore();

  return (
    <div>
      <h1>Welcome, {user?.displayName}!</h1>
      <p>Token: {accessToken?.substring(0, 20)}...</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Make API Calls with Auth

```jsx
import axiosClient from './shared/api/axiosClient';

// Token is automatically added to request headers
const response = await axiosClient.get('/chat/messages');
```

## 🎨 Customization

### Change Theme Colors

Edit `App.jsx`:
```jsx
const theme = {
  token: {
    colorPrimary: '#1890ff', // Change this
    borderRadius: 8,
  },
};
```

### Customize Login Form

Edit `LoginForm.jsx`:
- Add remember me checkbox
- Add forgot password link
- Change button text
- Add terms & conditions

### Dark Mode

Uncomment in `App.jsx`:
```jsx
import { useColorScheme } from 'antd/es/app/theme/useColorScheme';

// Add dark mode toggle
const { setColorScheme } = useColorScheme();
```

## 📱 Responsive Breakpoints

```
xs: 0px
sm: 576px
md: 768px
lg: 992px
xl: 1200px
xxl: 1600px
```

The login form is responsive on all breakpoints.

## ⚠️ Security Notes

1. **Never commit `.env.local`**: Add to `.gitignore`
2. **HTTPS only in production**: Always use HTTPS for API calls
3. **Secure cookies**: Store token in secure httpOnly cookie for production
4. **CORS**: Configure CORS on backend properly
5. **CSP**: Add Content Security Policy headers
6. **Validate input**: Frontend validation + backend validation

## 🐛 Troubleshooting

### Google Sign-In not showing

1. Check if script loaded: `window.google.accounts` exists
2. Verify Client ID in `.env.local`
3. Check console for errors
4. Ensure authorized redirect URI matches

### Token not persisting

1. Check browser localStorage: `localStorage.getItem('auth-storage')`
2. Verify Zustand persist middleware
3. Check localStorage quota

### API calls failing

1. Check if backend is running on configured port
2. Verify CORS headers from backend
3. Check network tab in DevTools
4. Verify token format in Authorization header

### Login form not responsive

1. Check window size
2. Verify Ant Design breakpoints
3. Clear browser cache
4. Check CSS media queries

## 📚 Dependencies

- **React**: UI library
- **React Router**: Client-side routing
- **Ant Design**: UI components library
- **Zustand**: State management
- **Axios**: HTTP client
- **Google Identity Services**: Google OAuth

## 🔄 Development Workflow

1. **Start dev server**:
   ```bash
   pnpm run dev
   ```
   Visit: `http://localhost:5173`

2. **Build for production**:
   ```bash
   pnpm run build
   ```

3. **Preview production build**:
   ```bash
   pnpm run preview
   ```

4. **Lint code**:
   ```bash
   pnpm run lint
   ```

## 📝 Adding Features

### Add Remember Me

```jsx
// In LoginForm.jsx
<Form.Item name="remember" valuePropName="checked">
  <Checkbox>Remember me</Checkbox>
</Form.Item>
```

### Add Password Reset

```jsx
// In LoginForm.jsx
<Row justify="space-between">
  <Button type="link" href="/forgot-password">
    Forgot password?
  </Button>
</Row>
```

### Add Sign Up Flow

```jsx
// Create features/auth/pages/RegisterPage.jsx
// Add route in App.jsx
<Route path="/register" element={<RegisterPage />} />
```

## 🚀 Deployment

### Vercel

```bash
vercel
```

### Netlify

```bash
netlify deploy --prod --dir=dist
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm run build
EXPOSE 5173
CMD ["pnpm", "run", "preview"]
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console errors (F12)
3. Check network requests (Network tab)
4. Review Zustand state (React DevTools)

---

**Happy coding! 🚀**
