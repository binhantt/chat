# API Documentation - Report Module

## Overview
The Report module provides functionality for users to report issues and for administrators to manage these reports. This includes creating reports, viewing reports, and updating report status.

## API Endpoints

### Base URL
```
/reports
```

### Authentication
All endpoints require authentication using the `DemoAuthGuard`. Only admin users can view and update reports.

## Endpoints

### 1. Create Report
**POST** `/reports`

Create a new report.

**Request Body:**
```json
{
  "reportedUserId": "uuid",
  "reason": "spam|harassment|inappropriate_content|fake_profile|underage|other",
  "description": "Optional detailed description"
}
```

**Response:**
```json
{
  "id": "uuid",
  "reporterId": "uuid",
  "reportedUserId": "uuid",
  "reason": "spam",
  "description": "Optional description",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- 201: Report created successfully
- 400: Invalid request data
- 401: Unauthorized
- 403: Forbidden (non-admin attempting to access admin endpoints)

### 2. Get All Reports (Admin Only)
**GET** `/reports`

Retrieve all reports for administrative purposes. Returns reports in descending order of creation date.

**Response:**
```json
[
  {
    "id": "uuid",
    "reason": "spam",
    "description": "Description of the issue",
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
    },
    "recentPartners": [
      {
        "id": "uuid",
        "fullName": "Partner Name",
        "avatarUrl": "url"
      }
    ]
  }
]
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden (non-admin user)

### 3. Get Report by ID (Admin Only)
**GET** `/reports/:id`

Retrieve a specific report by its ID.

**Response:**
```json
{
  "id": "uuid",
  "reason": "spam",
  "description": "Description of the issue",
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
  },
  "recentPartners": [
    {
      "id": "uuid",
      "fullName": "Partner Name",
      "avatarUrl": "url"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden (non-admin user)
- 404: Report not found

### 4. Update Report Status (Admin Only)
**PATCH** `/reports/:id/status`

Update the status of a specific report.

**Request Body:**
```json
{
  "status": "pending|reviewed|resolved|rejected"
}
```

**Response:**
```json
{
  "id": "uuid",
  "reason": "spam",
  "description": "Description of the issue",
  "status": "reviewed",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T01:00:00.000Z"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid status value
- 401: Unauthorized
- 403: Forbidden (non-admin user)
- 404: Report not found

## Data Models

### ReportReason Enum
- `spam`: Spam content
- `harassment`: Harassment
- `inappropriate_content`: Inappropriate content
- `fake_profile`: Fake profile
- `underage`: Underage user
- `other`: Other reason

### ReportStatus Enum
- `pending`: Pending review
- `reviewed`: Under review
- `resolved`: Issue resolved
- `rejected`: Report rejected

### CreateReportDto
```typescript
{
  reportedUserId: string; // UUID of the user being reported
  reason: ReportReason;   // Reason for the report
  description?: string;   // Optional detailed description
}
```

### ReportWithContext
```typescript
{
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: Date;
  reporter: {
    id: string;
    fullName: string | null;
    email: string;
  };
  reportedUser: {
    id: string;
    fullName: string | null;
    email: string;
  };
  recentPartners: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  }[];
}
```

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "message": "Chỉ admin mới có quyền xem báo cáo"
}
```

#### 404 Not Found
```json
{
  "message": "Report not found"
}
```

#### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": ["Field validation error"]
}
```

## Usage Examples

### Creating a Report
```javascript
const response = await fetch('/reports', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  body: JSON.stringify({
    reportedUserId: 'uuid-of-reported-user',
    reason: 'spam',
    description: 'User is sending spam messages'
  })
});

const data = await response.json();
```

### Updating Report Status (Admin)
```javascript
const response = await fetch('/reports/uuid/status', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  body: JSON.stringify({
    status: 'reviewed'
  })
});

const data = await response.json();
```

## Security Considerations

1. **Authentication**: All endpoints require authentication
2. **Authorization**: Only admin users can access GET and PATCH endpoints
3. **Input Validation**: All inputs are validated using class-validator
4. **Data Sanitization**: User inputs are properly sanitized to prevent injection attacks

## Rate Limiting

Implement rate limiting for report creation endpoints to prevent abuse:
- Max 5 reports per minute per user
- Max 50 reports per day per user