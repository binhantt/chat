# Usage Examples

## 🎯 Using Auth System

### Basic Login

```typescript
// In any component
import { useAuth } from '@/features/auth';

export function MyComponent() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // User is now logged in
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div>
      <button onClick={() => handleLogin('user@example.com', 'password123')} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### Access Current User

```typescript
import { useAuth, useCurrentUser } from '@/features/auth';

export function UserProfile() {
  const { user } = useAuth();
  const currentUser = useCurrentUser();

  return (
    <div>
      <h1>Welcome, {user?.displayName}!</h1>
      <p>Email: {currentUser?.email}</p>
      <p>Trust Score: {currentUser?.trustScore}</p>
    </div>
  );
}
```

### Check Authentication Status

```typescript
import { useIsAuthenticated } from '@/features/auth';

export function Header() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <header>
      {isAuthenticated ? (
        <button>Logout</button>
      ) : (
        <button>Login</button>
      )}
    </header>
  );
}
```

### Protected Routes

```typescript
import { ProtectedRoute, LoginPage } from '@/features/auth';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## 🔧 Using Utilities

### Error Handling

```typescript
import { formatErrorMessage, isAuthError } from '@/shared';

try {
  await login(email, password);
} catch (error) {
  const message = formatErrorMessage(error);
  
  if (isAuthError(error)) {
    // Handle auth errors specially
    redirectToLogin();
  }
}
```

### Validation

```typescript
import { isValidEmail, isStrongPassword } from '@/shared';

const email = 'user@example.com';
const password = 'MySecurePass123!@#';

if (!isValidEmail(email)) {
  console.log('Invalid email');
}

if (isStrongPassword(password)) {
  console.log('Password is strong');
}
```

### Token Management

```typescript
import { getToken, hasValidToken, isTokenExpiringSoon } from '@/shared';

const token = getToken();
if (hasValidToken()) {
  console.log('Token is valid');
}

if (isTokenExpiringSoon()) {
  console.log('Token expires in 5 minutes');
  // Refresh token
}
```

### Storage

```typescript
import { setStorageItem, getStorageItem } from '@/shared';

// Set with 1 hour expiry
setStorageItem('user_preferences', { theme: 'dark' }, 60);

// Get item
const prefs = getStorageItem('user_preferences');
```

## 🔌 Using API Service

### Direct API Calls

```typescript
import { axiosClient } from '@/shared';

// Get messages
const messages = await axiosClient.get('/chat/messages');

// Send message
await axiosClient.post('/chat/messages', {
  content: 'Hello!',
  roomId: 'room123'
});

// Update profile
await axiosClient.put('/users/profile', {
  displayName: 'New Name'
});
```

### Error Handling in API

```typescript
import { axiosClient } from '@/shared';
import { formatErrorMessage } from '@/shared';

try {
  const response = await axiosClient.post('/chat/messages', data);
  console.log('Success:', response.data);
} catch (error: any) {
  const message = formatErrorMessage(error);
  console.error('Error:', message);
}
```

## 🎨 Using Components

### Login Form

```typescript
import { LoginForm } from '@/features/auth';

export function AuthPage() {
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <LoginForm />
    </div>
  );
}
```

### Login Page (Full Page)

```typescript
import { LoginPage } from '@/features/auth';

export function App() {
  return <LoginPage />;
}
```

## 🛡️ Advanced Patterns

### Create Custom Auth Hook

```typescript
import { useAuth } from '@/features/auth';
import { useNavigate } from 'react-router-dom';

export const useAuthFlow = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await auth.login(email, password);
      navigate('/chat');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };

  return {
    ...auth,
    handleLogin,
    handleLogout,
  };
};

// Usage
export function LoginComponent() {
  const { handleLogin, isLoading } = useAuthFlow();
  
  return (
    <button 
      onClick={() => handleLogin('user@example.com', 'pass')} 
      disabled={isLoading}
    >
      Login
    </button>
  );
}
```

### Create Protected Data Hook

```typescript
import { useAuth } from '@/features/auth';
import { useEffect, useState } from 'react';
import { axiosClient } from '@/shared';

export const useProtectedData = (endpoint: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axiosClient.get(endpoint);
        setData(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, isAuthenticated]);

  return { data, loading, error };
};

// Usage
export function ChatMessages() {
  const { data: messages, loading, error } = useProtectedData('/chat/messages');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {messages?.map((msg) => (
        <li key={msg.id}>{msg.content}</li>
      ))}
    </ul>
  );
}
```

### Create Auth Guard Middleware

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { isTokenExpiringSoon } from '@/shared';

export const useAuthGuard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check token expiry
    if (isTokenExpiringSoon()) {
      logout();
      navigate('/login');
    }
  }, [isAuthenticated, navigate, logout]);
};

// Usage in protected pages
export function ChatPage() {
  useAuthGuard();

  return (
    <div>
      {/* Chat content */}
    </div>
  );
}
```

## 📋 Checklist for Integration

- [ ] Install dependencies: `pnpm install`
- [ ] Create `.env.local` with API URL and Google Client ID
- [ ] Update backend API base URL
- [ ] Verify Google OAuth credentials
- [ ] Update theme colors if needed
- [ ] Add company logo to login form
- [ ] Set up routing for your pages
- [ ] Configure CORS on backend
- [ ] Test login flow
- [ ] Test token persistence
- [ ] Test protected routes
- [ ] Test logout flow
- [ ] Test error handling
- [ ] Performance testing
- [ ] Security testing (XSS, CSRF)

---

**Ready to go! Happy coding! 🚀**
