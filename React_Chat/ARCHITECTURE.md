# Architecture Overview

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      LoginPage                            │  │
│  │                    (Router Entry)                         │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │                    LoginForm                              │  │
│  │              (UI Components)                              │  │
│  │                                                           │  │
│  │  ┌─────────────┐          ┌──────────────────┐           │  │
│  │  │Email/Pass   │          │ Google Sign-In   │           │  │
│  │  │  Input      │          │   Button         │           │  │
│  │  └──────┬──────┘          └────────┬─────────┘           │  │
│  │         │                          │                       │  │
│  │         └──────────────┬───────────┘                       │  │
│  │                        │                                    │  │
│  │                        ▼                                    │  │
│  │            ┌──────────────────────┐                       │  │
│  │            │  useAuthStore()      │                       │  │
│  │            │  (Zustand)           │                       │  │
│  │            │  - login()           │                       │  │
│  │            │  - loginWithGoogle() │                       │  │
│  │            │  - logout()          │                       │  │
│  │            └──────────┬───────────┘                       │  │
│  └─────────────────────┬─────────────────────────────────────┘  │
│                        │                                         │
│  ┌─────────────────────▼─────────────────────────────────────┐  │
│  │                  authService                              │  │
│  │          (API Service Layer)                              │  │
│  │                                                           │  │
│  │  ┌──────────────┐           ┌────────────────┐           │  │
│  │  │ POST /login  │           │ POST /google   │           │  │
│  │  └──────┬───────┘           └────────┬───────┘           │  │
│  │         │                            │                    │  │
│  │         └──────────────┬─────────────┘                    │  │
│  │                        │                                   │  │
│  │                        ▼                                   │  │
│  │          ┌─────────────────────────┐                      │  │
│  │          │  axiosClient            │                      │  │
│  │          │  - Add Bearer Token     │                      │  │
│  │          │  - Handle errors        │                      │  │
│  │          └────────────┬────────────┘                      │  │
│  └─────────────────────┬─────────────────────────────────────┘  │
└────────────────────────┼──────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼──────────┐         ┌──────────▼─────────┐
│  localStorage     │         │  Backend Server    │
│                   │         │                    │
│ - auth-storage:   │         │ ┌─────────────┐    │
│   - user          │         │ │ AuthService │    │
│   - accessToken   │         │ │             │    │
│                   │         │ │ - Verify    │    │
│ - Authorization   │         │ │ - JWT Issue │    │
│   Header          │         │ │ - Response  │    │
│                   │         │ └─────────────┘    │
└───────────────────┘         │                    │
                              │ Response:          │
                              │ {                  │
                              │   accessToken,     │
                              │   user             │
                              │ }                  │
                              └────────────────────┘
```

## Component Interaction

```
App.jsx
├── Router (React Router)
│   ├── /login → LoginPage
│   │   └── LoginForm
│   │       ├── Form (Ant Design)
│   │       ├── Email Input
│   │       ├── Password Input
│   │       └── Google Sign-In Button
│   │
│   └── /chat → ProtectedRoute → ChatPage
│
└── useAuthStore (Zustand)
    ├── state:
    │   ├── user
    │   ├── accessToken
    │   ├── isLoading
    │   └── error
    │
    └── actions:
        ├── login()
        ├── loginWithGoogle()
        ├── logout()
        └── clearError()
```

## State Management Flow

```
1. User enters credentials
   ↓
2. Form submits with values
   ↓
3. LoginForm calls useAuthStore.login()
   ↓
4. Zustand sets isLoading = true
   ↓
5. authService.login() is called
   ↓
6. axiosClient makes POST request
   ↓
7. Backend validates & returns token + user
   ↓
8. Zustand updates state with user & token
   ↓
9. localStorage automatically persists (persist middleware)
   ↓
10. useAuthStore triggers re-render
   ↓
11. LoginPage detects user & redirects to /chat
   ↓
12. isLoading = false, success!
```

## Authentication Flow Detailed

```
┌─────────────────────────────────────────────────────────────┐
│                    Login Sequence                            │
└─────────────────────────────────────────────────────────────┘

1. User Action
   │
   └─→ Enter email & password
       Click "Login" button
   │
   └─→ Form validation:
       - Email format check
       - Password length check
       - Both required
   │
   └─→ If valid → continue
       If invalid → show validation error

2. API Call
   │
   └─→ useAuthStore.login(email, password)
   │
   └─→ authService.login(email, password)
   │
   └─→ axiosClient.post('/auth/login', {email, password})
       │
       ├─→ Request interceptor:
       │   └─→ Add headers
       │   └─→ Add token (if exists)
       │
       └─→ Send to Backend

3. Backend Response
   │
   ├─→ Success (200):
   │   {
   │     accessToken: "jwt...",
   │     user: { id, email, displayName, ... }
   │   }
   │
   └─→ Error (400/401):
       {
         message: "Invalid credentials",
         error: "INVALID_CREDENTIALS"
       }

4. Update State
   │
   ├─→ On Success:
   │   ├─→ Set user = response.user
   │   ├─→ Set accessToken = response.accessToken
   │   ├─→ Set isLoading = false
   │   ├─→ Set error = null
   │   │
   │   └─→ localStorage.setItem('auth-storage', {...})
   │
   └─→ On Error:
       ├─→ Set user = null
       ├─→ Set accessToken = null
       ├─→ Set isLoading = false
       └─→ Set error = error.message

5. UI Update & Navigation
   │
   ├─→ Form hides, loading stops
   │
   ├─→ Redirect to /chat
   │   (via useEffect in LoginPage)
   │
   └─→ ProtectedRoute validates:
       └─→ user && accessToken exist?
           ├─→ Yes → Render ChatPage
           └─→ No → Redirect to /login

6. Session Persistence
   │
   └─→ Page refresh:
       ├─→ Zustand loads from localStorage
       ├─→ useAuthStore restores:
       │   ├─→ user
       │   └─→ accessToken
       │
       └─→ ProtectedRoute checks on app load
           └─→ User stays logged in ✓
```

## Google OAuth Flow

```
1. Google Sign-In Button Rendered
   │
   └─→ google.accounts.id.renderButton()
       └─→ Uses VITE_GOOGLE_CLIENT_ID

2. User Clicks Google Button
   │
   └─→ Google Identity Services popup
       └─→ User signs in with Google account

3. Callback Handler Triggered
   │
   └─→ handleGoogleResponse(response)
       └─→ response.credential = JWT from Google

4. Send to Backend
   │
   └─→ useAuthStore.loginWithGoogle(credential)
       │
       └─→ authService.loginWithGoogle(credential)
           │
           └─→ axiosClient.post('/auth/google', {credential})

5. Backend Validates Google JWT
   │
   ├─→ Decode credential
   ├─→ Verify signature with Google
   ├─→ Extract user info
   └─→ Create/update user in DB
       └─→ Return accessToken + user

6. Same State Update & Navigation
   │
   └─→ Same as email/password flow
       └─→ User logged in successfully ✓
```

## Error Handling

```
┌────────────────────────────────────────┐
│      Error Handling Pipeline            │
└────────────────────────────────────────┘

API Request Error
    │
    ├─→ Network Error
    │   └─→ "Network request failed"
    │
    ├─→ 400 Bad Request
    │   └─→ "Invalid email or password"
    │
    ├─→ 401 Unauthorized
    │   ├─→ "Invalid credentials"
    │   └─→ Clear token, redirect to /login
    │
    ├─→ 500 Server Error
    │   └─→ "Server error, please try again"
    │
    └─→ Unknown Error
        └─→ "An error occurred"

State Update
    │
    └─→ Set error in Zustand
        └─→ error = error message

UI Display
    │
    └─→ <Alert type="error" message={error} />
        └─→ Show to user
        └─→ Allow user to close (clearError)

User Action
    │
    └─→ Can retry login
        └─→ New attempt clears previous error
```

## Token Persistence & Refresh

```
Session Lifecycle
│
├─→ Login Successful
│   ├─→ Zustand persist saves to localStorage:
│   │   {
│   │     state: { user: {...}, accessToken: "..." },
│   │     version: 0
│   │   }
│   │
│   └─→ axiosClient stores Authorization header
│
├─→ Page Refresh
│   ├─→ App loads
│   ├─→ Zustand rehydrates from localStorage
│   ├─→ useAuthStore has user + accessToken
│   ├─→ ProtectedRoute validates
│   └─→ User stays logged in (no re-login needed)
│
├─→ Token Expires (401)
│   ├─→ Response interceptor detects 401
│   ├─→ Clear localStorage
│   ├─→ Clear Zustand state
│   ├─→ Redirect to /login
│   └─→ User must login again
│
└─→ Manual Logout
    ├─→ Call useAuthStore.logout()
    ├─→ Clear all state
    ├─→ Clear localStorage
    ├─→ Redirect to /login
    └─→ Session ended
```

---

**This architecture ensures:**
- ✅ Clean separation of concerns
- ✅ Easy state management
- ✅ Automatic token persistence
- ✅ Protected routes
- ✅ Error handling
- ✅ Scalability
