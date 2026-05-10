# Chat Backend API Documentation

## Overview
This is the backend API for a chat application built with NestJS. It provides user authentication, chat functionality, matching services, and reporting capabilities.

## Features
- **User Authentication**: JWT-based authentication with role-based access control
- **Chat System**: Real-time messaging with conversation management
- **Matching System**: User matching and pairing functionality
- **Report System**: User reporting and admin management
- **Database**: PostgreSQL with TypeORM
- **API Documentation**: Comprehensive API documentation

## Tech Stack
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT
- **Validation**: class-validator

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "user"
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user"
  }
}
```

### Chat Endpoints

#### Get Conversations
```http
GET /chat/conversations
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user1": {
      "id": "uuid",
      "fullName": "John Doe",
      "avatarUrl": "url"
    },
    "user2": {
      "id": "uuid",
      "fullName": "Jane Smith",
      "avatarUrl": "url"
    },
    "lastMessage": {
      "id": "uuid",
      "content": "Hello!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
]
```

#### Get Messages
```http
GET /chat/conversations/:id/messages
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "content": "Hello!",
    "senderId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Send Message
```http
POST /chat/conversations/:id/messages
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Hello!"
}
```

**Response:**
```json
{
  "id": "uuid",
  "content": "Hello!",
  "senderId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Matching Endpoints

#### Get Matches
```http
GET /match/matches
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "matchedUserId": "uuid",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Create Match Request
```http
POST /match/matches
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "matchedUserId": "uuid",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Report Endpoints

#### Create Report
```http
POST /reports
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reportedUserId": "uuid",
  "reason": "spam",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "id": "uuid",
  "reason": "spam",
  "description": "Optional description",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get All Reports (Admin Only)
```http
GET /reports
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "reason": "spam",
    "description": "Description",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "reporter": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "reportedUser": {
      "id": "uuid",
      "fullName": "Jane Smith",
      "email": "jane@example.com"
    }
  }
]
```

#### Update Report Status (Admin Only)
```http
PATCH /reports/:id/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "reviewed"
}
```

**Response:**
```json
{
  "id": "uuid",
  "reason": "spam",
  "description": "Description",
  "status": "reviewed",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T01:00:00.000Z"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id),
  FOREIGN KEY (user2_id) REFERENCES users(id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);
```

### Reports Table
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (reported_user_id) REFERENCES users(id)
);
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/chat_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Server
PORT=3000
```

## Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "message": "Error description",
  "error": "Error type",
  "statusCode": 400
}
```

Common error codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

The token is obtained by logging in or registering.

## Rate Limiting

Implement rate limiting to prevent abuse:
- Authentication endpoints: 5 requests per minute
- API endpoints: 100 requests per minute
- Report creation: 10 requests per minute

## Security Considerations

1. **Password Hashing**: Use bcrypt for password hashing
2. **JWT Security**: Use strong JWT secrets and appropriate expiration times
3. **Input Validation**: Validate all user inputs
4. **SQL Injection**: Use parameterized queries
5. **CORS**: Configure CORS properly for your frontend
6. **HTTPS**: Always use HTTPS in production

## Testing

Run tests with:
```bash
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
