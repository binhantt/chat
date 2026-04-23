x# React Chat Application

A modern, real-time chat application built with React, TypeScript, and Vite.

## Features

- **Real-time Messaging**: Instant message delivery using WebSocket connections
- **Google Authentication**: Secure login with Google OAuth2
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Message History**: Persistent chat history storage
- **Notifications**: Real-time desktop and in-app notifications
- **User Presence**: See who's online and typing indicators
- **Room-based Chat**: Support for multiple chat rooms
- **Emoji Support**: Rich emoji picker for expressive communication
- **Dark/Light Mode**: Theme support for user preference
- **Message Reactions**: React to messages with emojis
- **File Sharing**: Upload and share files in chat
- **Search Functionality**: Search through chat history
- **Accessibility**: WCAG 2.1 compliant interface

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and builds
- **State Management**: Zustand for lightweight state management
- **Styling**: CSS Modules with modern CSS features
- **HTTP Client**: Axios for API communication
- **WebSocket**: Native WebSocket API for real-time communication
- **Icons**: React Icons for consistent iconography
- **Form Validation**: React Hook Form with Zod validation
- **Notifications**: Sonner for toast notifications
- **Date Handling**: date-fns for date formatting and manipulation

## Project Structure

```
React_Chat/
├── public/                 # Static assets
├── src/
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   ├── assets/             # Static assets (CSS, images, etc.)
│   │   └── css.css         # Global styles
│   ├── features/           # Feature-based organization
│   │   ├── auth/           # Authentication features
│   │   │   ├── components/ # Auth-specific components
│   │   │   ├── hooks/      # Custom auth hooks
│   │   │   ├── pages/      # Auth pages (login, etc.)
│   │   │   ├── services/   # Auth API services
│   │   │   ├── store/      # Auth state management
│   │   │   └── types/      # Auth TypeScript types
│   │   ├── chat/           # Chat features
│   │   │   ├── components/ # Chat-specific components
│   │   │   ├── mock/       # Mock data for development
│   │   │   ├── pages/      # Chat pages
│   │   │   ├── services/   # Chat API services
│   │   │   └── types/      # Chat TypeScript types
│   └── shared/             # Shared code across features
│       ├── api/            # API configuration and clients
│   │   │   └── axiosClient.ts # Axios instance setup
│   │   ├── constants/      # Application constants
│   │   │   └── config.ts   # Configuration values
│   │   ├── utils/          # Utility functions
│   │   │   ├── cookieAuthStorage.ts # Cookie-based auth storage
│   │   │   ├── errorHandler.ts # Global error handling
│   │   │   ├── storage.ts  # Local/session storage helpers
│   │   │   ├── tokenManager.ts # JWT token management
│   │   │   └── validators.ts # Form validation schemas
│   └── index.html          # HTML template
├── .eslintrc.cjs           # ESLint configuration
├── .gitignore              # Git ignore rules
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── pnpm-lock.yaml          # PNPM lock file
├── README.md               # This file
├── tsconfig.json           # TypeScript configuration
├── tsconfig.app.json       # App-specific TypeScript config
├── tsconfig.node.json      # Node-specific TypeScript config
├── vite.config.ts          # Vite configuration
└── vitest.config.ts        # Vitest testing configuration
```

## Setup Instructions

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_WS_URL=ws://localhost:3001
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run unit tests with Vitest
- `pnpm lint` - Run ESLint for code quality

## Features in Detail

### Authentication
- Secure Google OAuth2 flow
- JWT token storage in HTTP-only cookies (via backend)
- Automatic token refresh
- Protected routes requiring authentication

### Chat Functionality
- Real-time message sending and receiving
- Message history persistence
- Typing indicators
- Read receipts
- Message editing and deletion
- Reply to specific messages
- Threaded conversations (planned)

### User Interface
- Clean, modern design with intuitive navigation
- Sidebar for room/list navigation
- Message bubbles with avatar support
- Loading states and skeleton screens
- Empty states with helpful guidance
- Keyboard shortcuts for common actions

### Notifications
- Desktop notifications for new messages (when app is in background)
- In-app toast notifications for various events
- Notification preferences (sound, desktop, etc.)

### Performance
- Code splitting for faster initial loads
- React.memo for preventing unnecessary re-renders
- Virtualized lists for long message histories
- Efficient WebSocket connection management
- Optimistic UI updates for better perceived performance

## Development Guidelines

### Code Organization
- Follow feature-based folder structure
- Keep components small and focused
- Use custom hooks for reusable logic
- Separate concerns: UI, logic, data fetching
- Export only what's needed from each file

### TypeScript
- Use strict type checking
- Define interfaces for all props and state
- Utilize generics where appropriate
- Avoid `any` type when possible
- Use type inference when types are obvious

### Styling
- Use CSS Modules for component-scoped styles
- Follow BEM-like naming conventions
- Use CSS variables for theme colors
- Keep global styles minimal
- Use responsive design principles

### State Management
- Use Zustand for global state (auth, user preferences)
- Use React Query for server state (if implemented)
- Use useState/useReducer for local component state
- Avoid prop drilling by lifting state up appropriately
- Normalize API responses before storing in state

### Testing
- Write unit tests for hooks and utilities
- Write component tests with React Testing Library
- Mock API calls in tests
- Test both positive and negative cases
- Aim for meaningful test coverage, not just line coverage

## API Integration

The frontend communicates with the backend REST API and WebSocket service:

### REST Endpoints
- `POST /api/auth/google` - Initiate Google login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/chat/rooms` - Get list of chat rooms
- `POST /api/chat/rooms` - Create new chat room
- `GET /api/chat/rooms/:roomId/messages` - Get message history
- `POST /api/chat/rooms/:roomId/messages` - Send new message
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read

### WebSocket Events
- `connection` - Establish WebSocket connection
- `joinRoom` - Join a specific chat room
- `leaveRoom` - Leave a chat room
- `sendMessage` - Send a message to room
- `newMessage` - Receive new message from room
- `userJoined` - Notify when user joins room
- `userLeft` - Notify when user leaves room
- `typingStart` - User started typing
- `typingStop` - User stopped typing
- `notification` - Receive new notification

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Chrome
- Mobile Safari

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Vite team for the amazing build tool
- React team for the powerful UI library
- Zustand team for simple state management
- All open-source contributors whose packages we use
