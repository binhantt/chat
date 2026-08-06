# Report System - Technical Documentation

## Overview

The report system allows users to submit reports about issues (spam, harassment, inappropriate content...) and enables admins to manage and review these reports.

## System Architecture

```
+-----------------------------------------------------------+
|                    FRONTEND (Next.js)                    |
|  +------------+  +-------------+  +------------------------+  |
|  | ReportForm|  |ReportStats|  | ReportHistory        |  |
|  | Submit    |  | Statistics |  | Report History      |  |
|  | Report    |  |           |  |                      |  |
|  `------------+  `-------------+  `------------------------+  |
|       |              |                    |              |
|       `---------------+---------------------+              |
|                      | REST API                         |
|-----------------------+-----------------------------------
|                    BACKEND (NestJS)                      |
|  +------------------------------------------------------+  |
|  |  ReportController  (Handle HTTP requests)           |  |
|  |  |--- POST /reports        - Create new report      |  |
|  |  |--- GET  /reports        - Get all (admin)        |  |
|  |  |--- GET  /reports/:id    - Get by ID (admin)      |  |
|  |  `--- PATCH /reports/:id   - Update status          |  |
|  `------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  |  ReportService  (Business Logic)                   |  |
|  |  |--- create()         - Create report              |  |
|  |  |--- findAllForAdmin()- Get all for admin          |  |
|  |  |--- findOneForAdmin()- Get one report for admin   |  |
|  |  `--- updateStatus()   - Update status              |  |
|  `------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  |  Database (PostgreSQL + TypeORM)                   |  |
|  |  `--- Table: reports                                 |  |
|  `------------------------------------------------------+  |
`-----------------------------------------------------------+
```

## Directory Structure

```
backend/src/report/
|--- report.controller.ts    # Controller - Handle HTTP requests
|--- report.service.ts       # Service - Business logic
|--- report.module.ts        # Module - Register dependencies
|--- entities/
|   `--- report.entity.ts    # Entity - Database table structure
|--- dto/
|   `--- create-report.dto.ts # DTO - Data Transfer Object
`--- interfaces/
    `--- (if any)
```

## API Endpoints

### 1. Create New Report

```
POST /api/reports
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reportedUserId": "uuid-of-reported-user",
  "reason": "spam | harassment | inappropriate_content | fake_profile | underage | other",
  "description": "Detailed description (optional)"
}
```

**Response (201 - Created):**
```json
{
  "id": "report-uuid",
  "reporterId": "sender-uuid",
  "reportedUserId": "reported-user-uuid",
  "reason": "spam",
  "description": "Detailed description",
  "status": "pending",
  "createdAt": "2026-05-10T10:00:00.000Z"
}
```

**Possible Errors:**
```json
// 400 - Invalid data
{
  "message": "Validation failed",
  "errors": ["reportedUserId must be a UUID"]
}

// 401 - Not logged in
{
  "message": "Unauthorized"
}
```

---

### 2. Get All Reports (Admin Only)

```
GET /api/reports
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 - Success):**
```json
[
  {
    "id": "report-uuid",
    "reason": "spam",
    "description": "Description",
    "status": "pending",
    "createdAt": "2026-05-10T10:00:00.000Z",
    "reporter": {
      "id": "uuid",
      "fullName": "Sender",
      "email": "sender@example.com"
    },
    "reportedUser": {
      "id": "uuid",
      "fullName": "Reported User",
      "email": "reported@example.com"
    },
    "recentPartners": [
      {
        "id": "uuid",
        "fullName": "Recent Partner",
        "avatarUrl": "https://..."
      }
    ]
  }
]
```

**Errors:**
```json
// 403 - Not admin
{
  "message": "Chi admin moi co quyen xem bao cao"
}
```

---

### 3. Get Report by ID (Admin Only)

```
GET /api/reports/:id
```

**Response (200 - Success):**
```json
{
  "id": "report-uuid",
  "reason": "harassment",
  "description": "Detailed description",
  "status": "reviewed",
  "createdAt": "2026-05-10T10:00:00.000Z",
  "reporter": {
    "id": "uuid",
    "fullName": "Sender",
    "email": "sender@example.com"
  },
  "reportedUser": {
    "id": "uuid",
    "fullName": "Reported User",
    "email": "reported@example.com"
  },
  "recentPartners": []
}
```

**Errors:**
```json
// 404 - Not found
{
  "message": "Report not found"
}
```

---

### 4. Update Report Status (Admin Only)

```
PATCH /api/reports/:id/status
```

**Request Body:**
```json
{
  "status": "reviewed"
}
```

**Valid Status Values:**
- `pending` - Awaiting processing
- `reviewed` - Reviewed
- `resolved` - Resolved
- `rejected` - Rejected

**Response (200 - Success):**
```json
{
  "id": "report-uuid",
  "reason": "spam",
  "description": "Description",
  "status": "reviewed",
  "createdAt": "2026-05-10T10:00:00.000Z",
  "updatedAt": "2026-05-10T11:00:00.000Z"
}
```

---

## Enum Values

### ReportReason (Report Reason)

| Value | Description |
|-------|-------------|
| `spam` | Spam content |
| `harassment` | Harassment |
| `inappropriate_content` | Inappropriate content |
| `fake_profile` | Fake account |
| `underage` | Underage user |
| `other` | Other |

### ReportStatus (Report Status)

| Value | Description |
|-------|-------------|
| `pending` | Awaiting processing |
| `reviewed` | Reviewed |
| `resolved` | Resolved |
| `rejected` | Rejected |

---

## Data Models

### CreateReportDto
```typescript
export class CreateReportDto {
  @IsNotEmpty()
  @IsUUID()
  reportedUserId!: string;  // UUID of reported user

  @IsNotEmpty()
  @IsEnum(ReportReason)
  reason!: ReportReason;    // Report reason

  @IsOptional()
  @IsString()
  description?: string;     // Detailed description (optional)
}
```

### Report (Entity)
```typescript
@Entity('reports')
export class Report {
  id: string;              // UUID - Primary key
  reporterId: string;      // UUID of reporter
  reportedUserId: string;  // UUID of reported user
  reason: ReportReason;    // Report reason
  description: string;     // Detailed description
  status: ReportStatus;    // Status
  createdAt: Date;         // Creation time
  updatedAt: Date;         // Update time
}
```

### ReportWithContext (Admin Response)
```typescript
export interface ReportWithContext {
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

---

## Processing Flow

### User Submits Report
```
1. User selects "Report" on the interface
2. Select reason (spam, harassment, error...)
3. Enter detailed description
4. Click "Submit Report"
5. Frontend calls POST /api/reports
6. Backend saves to database with status = "pending"
7. Display success notification
```

### Admin Views and Processes Reports
```
1. Admin logs into dashboard
2. Call GET /api/reports to view report list
3. View details of each report via GET /api/reports/:id
4. Update status:
   - "reviewed" -> Reviewed
   - "resolved" -> Resolved
   - "rejected" -> Rejected (invalid)
5. Call PATCH /api/reports/:id/status
```

---

## Security

### Authentication
- All endpoints require authentication (JWT token)
- Use `DemoAuthGuard` for authentication

### Authorization
- **Regular users**: Can only create new reports
- **Admins**: Can view all reports and update status

### Validation
- Use `class-validator` to validate input
- `reportedUserId` must be a valid UUID
- `reason` must be one of the enum values

---

## Database Schema

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Index for performance
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);
```

---

## Frontend Components

### ReportForm.tsx
- Form to submit new reports
- Select report type (bug, suggest, abuse, other)
- Enter title and content
- Calls API POST /api/reports

### ReportStats.tsx
- Display report statistics
- Total reports, pending, reviewed, resolved
- Calls API GET /api/reports/stats

### ReportHistory.tsx
- Display user's report history
- Calls API GET /api/reports/my-reports
- Display status with colored badges

### AdminReportManagement.tsx
- Dashboard for admin to manage reports
- View list of all reports
- Update report status
- Calls API GET/PUT/PATCH /api/reports

---

## Rate Limiting

To prevent abuse:
- **Regular users**: Maximum 5 reports/minute, 50 reports/day
- **Admins**: No limit

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid data (validation failed) |
| 401 | Not logged in (Unauthorized) |
| 403 | No permission (Forbidden - admin only) |
| 404 | Report not found |
| 500 | Internal server error |

---

## Usage Examples

### Create Report (JavaScript)
```javascript
const createReport = async (reportedUserId, reason, description) => {
  const response = await fetch('/api/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      reportedUserId,
      reason,
      description
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

### Get All Reports for Admin (JavaScript)
```javascript
const getAllReports = async () => {
  const response = await fetch('/api/reports', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  return response.json();
};
```

### Update Status (JavaScript)
```javascript
const updateReportStatus = async (reportId, status) => {
  const response = await fetch(`/api/reports/${reportId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status })
  });
  
  return response.json();
};
```

---

## Development History

| Date | Description |
|------|-------------|
| 2026-05-10 | Created initial documentation |
| 2026-05-10 | Added API endpoints for frontend |
| 2026-05-10 | Created mock API routes for development |

---

## Links

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Report API Spec](./report-api.md)

---

*Documentation created on 10/05/2026*
