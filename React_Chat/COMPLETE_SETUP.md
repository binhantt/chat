# Complete Setup Guide

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- Git
- Google OAuth account

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd d:\chat\React_Chat

# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 2. Configure Environment

Create `.env.local` in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE

# Environment
VITE_ENV=development
```

### 3. Get Google Client ID

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Create Project**
3. Name your project (e.g., "Chat App")
4. Click **Create**

#### Step 2: Enable Google+ API
1. In the search bar, type "Google+ API"
2. Click **Enable**

#### Step 3: Create OAuth Credentials
1. Go to **Credentials** (left sidebar)
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Web application**
4. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173`
   - `http://localhost:3000`
   - `http://localhost:3000/api/auth/google` (or your backend callback)
5. Click **Create**
6. Copy the **Client ID**

#### Step 4: Update .env.local
```env
VITE_GOOGLE_CLIENT_ID=YOUR_COPIED_CLIENT_ID
```

### 4. Start Development Server

```bash
# Using pnpm
pnpm run dev

# Or using npm
npm run dev
```

Visit: `http://localhost:5173`

## 📁 Project Structure

```
React_Chat/
├── src/
│   ├── features/
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── LoginForm.tsx
│   │       │   ├── LoginForm.css
│   │       │   └── ProtectedRoute.tsx
│   │       ├── hooks/
│   │       │   └── useAuth.ts
│   │       ├── pages/
│   │       │   ├── LoginPage.tsx
│   │       │   └── LoginPage.css
│   │       ├── services/
│   │       │   └── auth.service.ts
│   │       ├── store/
│   │       │   └── auth.store.ts
│   │       ├── types/
│   │       │   └── auth.type.ts
│   │       └── index.ts
│   ├── shared/
│   │   ├── api/
│   │   │   └── axiosClient.ts
│   │   ├── constants/
│   │   │   └── config.ts
│   │   ├── utils/
│   │   │   ├── errorHandler.ts
│   │   │   ├── validators.ts
│   │   │   ├── tokenManager.ts
│   │   │   └── storage.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── App.css
├── .env.example
├── .env.local
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🔧 Configuration Files

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler"
  },
  "include": ["src"],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
```

## 📦 npm Scripts

### Available Commands

```bash
# Development
pnpm run dev          # Start dev server

# Build
pnpm run build        # Build for production
pnpm run preview      # Preview production build

# Code Quality
pnpm run lint         # Run ESLint
pnpm run type-check   # Run TypeScript type checking

# Installation
pnpm install          # Install dependencies
pnpm update           # Update dependencies
```

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local`
- ✅ Add `.env.local` to `.gitignore`
- ✅ Use `.env.example` as template

### 2. Token Management
- ✅ Tokens auto-persist via Zustand
- ✅ Token auto-removes on 401 error
- ✅ Use secure httpOnly cookies in production

### 3. HTTPS
- ✅ Always use HTTPS in production
- ✅ Configure CSP headers
- ✅ Enable CORS properly on backend

### 4. Input Validation
- ✅ Frontend validation for UX
- ✅ Always validate on backend
- ✅ Use type-safe forms

## 🚢 Deployment

### Build for Production

```bash
pnpm run build
```

This creates a `dist/` folder ready for deployment.

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
pnpm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm run build
EXPOSE 5173
CMD ["pnpm", "run", "preview"]
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

### Google Sign-In Not Working

1. Check if script loads:
   ```typescript
   console.log(window.google?.accounts);
   ```

2. Verify Client ID in `.env.local`

3. Check authorized URIs in Google Console

4. Clear browser cache and localStorage

### API Calls Failing

1. Verify backend is running:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Check CORS headers:
   ```bash
   curl -i http://localhost:3000/api/auth/login
   ```

3. Verify token format:
   ```javascript
   console.log(localStorage.getItem('auth-storage'));
   ```

4. Check network tab in DevTools

### Build Fails

```bash
# Clear cache
pnpm store prune

# Reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm run build
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [Ant Design Documentation](https://ant.design)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Axios Documentation](https://axios-http.com)
- [Vite Documentation](https://vitejs.dev)
- [Google Identity Services](https://developers.google.com/identity/gsi/web)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

MIT License - feel free to use this code

## 💬 Support

For issues or questions, please:
1. Check troubleshooting section
2. Review console errors (F12)
3. Check network requests
4. Create an issue on GitHub
