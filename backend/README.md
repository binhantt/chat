# Chat Application Backend

This is the backend service for the real-time chat application built with Node.js, TypeScript, and Express.

## Features

- **Authentication**: Google OAuth2 integration with JWT-based session management
- **Real-time Chat**: WebSocket-based messaging system
- **Notifications**: Real-time notification system
- **Role-based Access Control**: Attribute-Based Access Control (ABAC) middleware
- **Database**: PostgreSQL with Knex.js for migrations and queries
- **Security**: Session integrity checks, secure cookie handling

## Project Structure

```
backend/
├── src/
│   ├── application/
│   │   ├── dtos/           # Data Transfer Objects
│   │   ├── mappers/        # Entity-DTO mapping logic
│   │   └── use-cases/      # Application use cases (auth, chat, notifications)
│   ├── domain/
│   │   ├── entities/       # Core business entities (User, Message, Room)
│   │   ├── repositories/   # Repository interfaces
│   │   └── services/       # Domain services (permission checking)
│   ├── infrastructure/
│   │   ├── database/       # Database setup, connections, migrations, repositories
│   │   ├── external-services/ # Third-party integrations (Google Auth, Notification Service)
│   │   ├── security/       # Authentication, JWT, session integrity, ABAC middleware
│   │   └── webserver/      # Express server setup, controllers, routes
│   └── shared/             # Shared constants, errors, utilities
├── tests/                  # Unit tests
├── package.json
└── tsconfig.json
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file based on the example:
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=chat_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=your_jwt_secret
   ```

3. Run database migrations:
   ```bash
   npm run migrate
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with ts-node-dev
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run test` - Run unit tests

## API Documentation

API endpoints are organized under `/api`:
- `/api/auth` - Authentication routes (Google login, token refresh)
- `/api/chat` - Chat functionality (send messages, get history)
- `/api/notifications` - Notification management

## Database Schema

The database consists of three main tables:
- `users` - Stores user information
- `rooms` - Chat rooms for group conversations
- `messages` - Individual chat messages

See the migration files in `src/infrastructure/database/migrations/` for detailed schema.

## Security Features

- HTTP-only, secure cookies for session storage
- JWT refresh token rotation
- Session integrity validation to prevent tampering
- Attribute-Based Access Control (ABAC) for fine-grained permissions
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.