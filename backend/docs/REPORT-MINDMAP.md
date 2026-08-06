# Mind Map - Report System

## Overview

```
REPORT SYSTEM
|--- Backend (NestJS + PostgreSQL)
|   |--- Controller -> Handle HTTP Request
|   |--- Service -> Business Logic
|   |--- Entity -> Database Structure
|   |--- DTO -> Data Transfer Object
|   `--- Module -> Dependency Injection
|--- Frontend (Next.js + Radix UI)
|   |--- ReportForm -> Submit new report
|   |--- ReportStats -> Statistics
|   |--- ReportHistory -> Report history
|   `--- AdminReportManagement -> Management (Admin)
`--- API Routes (Next.js App Router)
    |--- POST /api/reports -> Create report
    |--- GET /api/reports -> Get all (Admin)
    |--- GET /api/reports/:id -> Get by ID (Admin)
    |--- PATCH /api/reports/:id/status -> Update status
    |--- GET /api/reports/stats -> Statistics
    `--- GET /api/reports/my-reports -> My reports
```

---

## Backend Architecture

### Directory Structure

```
backend/src/report/
|--- report.controller.ts     # HTTP Controller
|--- report.service.ts        # Business Logic
|--- report.module.ts         # NestJS Module
|--- entities/
|   `--- report.entity.ts     # TypeORM Entity
|--- dto/
|   `--- create-report.dto.ts # Validation DTO
`--- interfaces/
    `--- (extend if needed)
```

### Database Relationships

```
users ------< reports >-------- users
  |                              |
  | (reporter_id)                | (reported_user_id)
  |                              |
  `---- Reported by --------------+
       Being reported

reports ------< conversations >------ conversations
  |                                    |
  | (reported_user_id)                 |
  |                                    |
  `---- Recent partners of the reported user
```

### Entity: Report

```typescript
@Entity('reports')
class Report {
  id: UUID (Primary Key)
  reporterId: UUID (FK -> users.id)
  reportedUserId: UUID (FK -> users.id)
  reason: Enum (spam | harassment | inappropriate_content | fake_profile | underage | other)
  description: Text (nullable)
  status: Enum (pending | reviewed | resolved | rejected)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### DTO: CreateReportDto

```typescript
class CreateReportDto {
  @IsNotEmpty() @IsUUID()
  reportedUserId: string

  @IsNotEmpty() @IsEnum(ReportReason)
  reason: ReportReason

  @IsOptional() @IsString()
  description?: string
}
```

### Response: ReportWithContext

```typescript
interface ReportWithContext {
  id: string
  reason: string
  description: string | null
  status: string
  createdAt: Date
  reporter: {
    id: string
    fullName: string | null
    email: string
  }
  reportedUser: {
    id: string
    fullName: string | null
    email: string
  }
  recentPartners: {
    id: string
    fullName: string | null
    avatarUrl: string | null
  }[]
}
```

---

## API Endpoints

### 1 POST /api/reports - Create new report

```
 Request:
|--- Headers
|   |--- Authorization: Bearer <token>
|   `--- Content-Type: application/json
`--- Body
    |--- reportedUserId (required, UUID)
    |--- reason (required, enum)
    `--- description (optional, string)

 Response (201):
|--- id: UUID
|--- reporterId: UUID
|--- reportedUserId: UUID
|--- reason: string
|--- description: string | null
|--- status: "pending"
`--- createdAt: ISO Date

 Errors:
|--- 400 -> Validation failed
|--- 401 -> Unauthorized
`--- 403 -> Forbidden
```

### 2 GET /api/reports - Get all (Admin)

```
 Request:
`--- Headers
    `--- Authorization: Bearer <token> (Admin only)

 Response (200):
`--- Array of ReportWithContext

 Errors:
|--- 401 -> Unauthorized
`--- 403 -> Forbidden (non-admin)
```

### 3 GET /api/reports/:id - Get by ID (Admin)

```
 Request:
|--- Params: { id: UUID }
`--- Headers: Authorization: Bearer <token> (Admin only)

 Response (200):
`--- ReportWithContext

 Errors:
|--- 401 -> Unauthorized
|--- 403 -> Forbidden
`--- 404 -> Report not found
```

### 4 PATCH /api/reports/:id/status - Update status

```
 Request:
|--- Params: { id: UUID }
|--- Headers: Authorization: Bearer <token> (Admin only)
`--- Body:
    `--- status (required, enum: pending | reviewed | resolved | rejected)

 Response (200):
`--- ReportWithContext (with updatedAt)

 Errors:
|--- 400 -> Invalid status value
|--- 401 -> Unauthorized
|--- 403 -> Forbidden
`--- 404 -> Report not found
```

### 5 GET /api/reports/stats - Statistics

```
 Request:
`--- Headers: Authorization: Bearer <token> (Admin only)

 Response (200):
|--- totalReports: number
|--- pendingReports: number
|--- reviewedReports: number
|--- resolvedReports: number
`--- rejectedReports: number
```

### 6 GET /api/reports/my-reports - My reports

```
 Request:
`--- Headers: Authorization: Bearer <token>

 Response (200):
`--- Array of Report (filtered by reporterId = current user)
```

---

## Frontend Architecture

### Directory Structure

```
frontend/features/report/
|--- page/
|   `--- ReportPage.tsx           # Main page with Tabs
|--- components/
|   |--- ReportForm.tsx           # Report submission form
|   |--- ReportStats.tsx          # Statistics
|   |--- ReportHistory.tsx        # Report history
|   `--- AdminReportManagement.tsx # Admin management
`--- index.ts                     # Barrel export
```

### ReportPage (Tabs Navigation)

```typescript
<Tabs.Root defaultValue="user-reports">
  <Tabs.List>
    <Tabs.Trigger value="user-reports">My Reports</Tabs.Trigger>
    <Tabs.Trigger value="admin-management">Report Management</Tabs.Trigger>
    <Tabs.Trigger value="statistics">Statistics</Tabs.Trigger>
  </Tabs.List>

  <Tabs.Content value="user-reports">
    <ReportForm />
    <ReportStats />
    <ReportHistory />
  </Tabs.Content>

  <Tabs.Content value="admin-management">
    <AdminReportManagement />
  </Tabs.Content>

  <Tabs.Content value="statistics">
    <ReportStats detailed={true} />
  </Tabs.Content>
</Tabs.Root>
```

### ReportForm Component

```typescript
interface ReportFormProps {
  // Internal state
  title: string
  content: string
  category: string  // bug | suggest | abuse | other
  submitted: boolean
  error: string
  loading: boolean

  // API mapping
  category -> reason: {
    'bug' -> 'spam'
    'suggest' -> 'other'
    'abuse' -> 'harassment'
    'other' -> 'other'
  }

  // API call
  POST /api/reports
}
```

### ReportStats Component

```typescript
interface ReportStatsProps {
  detailed?: boolean  // Optional detailed view
}

// Displays:
// - Total reports ()
// - Pending ()
// - Reviewed ()
// - Resolved ()

// When detailed=true, shows:
// - Detailed statistics card
// - Badge breakdowns
// - Reports by category
// - Reports by user (top 5)
```

### ReportHistory Component

```typescript
interface Report {
  id: string
  reason: string
  description: string | null
  status: string
  createdAt: string
  reporter: { id, fullName, email }
  reportedUser: { id, fullName, email }
}

// Status colors:
// - pending -> yellow
// - reviewed -> violet
// - resolved -> green
// - rejected -> red

// Date formatting:
// - 1 day -> "Yesterday"
// - <7 days -> "X days ago"
// - <30 days -> "X weeks ago"
// - >30 days -> "X months ago"
```

### AdminReportManagement Component

```typescript
// Features:
// - Summary stats badges
// - Full reports table with columns:
//   | ID | Reason | Reporter | Reported User | Status | Created Date | Actions |
// - Detail modal with:
//   - Report details
//   - Status update dropdown
//   - Recent partners of reported user
//   - Description content
```

---

## Data Flow

```
+-------------------------------------------------------------------+
|                        DATA FLOW                                |
|                                                                 |
|  [User Clicks "Report"]                                         |
|         |                                                       |
|         v                                                       |
|  [ReportForm.tsx]                                               |
|         |                                                       |
|         v                                                       |
|  POST /api/reports -----------------------------------+          |
|         |                                            |          |
|         v                                            v          |
|  [Next.js API Route]                          [NestJS Controller]|
|         |                                            |          |
|         v                                            v          |
|  Forward to Backend              [ReportService.create()]       |
|         |                                            |          |
|         v                                            v          |
|  Response                        [TypeORM -> PostgreSQL]         |
|         |                                            |          |
|         v                                            |          |
|  [ReportForm shows success]                    |              |
|         |                                        |              |
|         v                                        v              |
|  [ReportHistory re-fetches]              [Report saved in DB]   |
|                                                                 |
|  [Admin views reports]                                          |
|         |                                                       |
|         v                                                       |
|  GET /api/reports -----------------------------------+           |
|         |                                            |           |
|         v                                            v           |
|  [NestJS Controller]                    [ReportService]          |
|         |                                            |           |
|         v                                            v           |
|  [ReportWithContext]              [Joins: reporter,              |
|         |                         reportedUser,                 |
|         v                         recentPartners]                |
|  [AdminReportManagement.tsx]                                   |
|         |                                                       |
|         v                                                       |
|  PATCH /api/reports/:id/status                                 |
|         |                                                       |
|         v                                                       |
|  [ReportService.updateStatus()]                                 |
|         |                                                       |
|         v                                                       |
|  [Status updated in DB]                                        |
`-------------------------------------------------------------------+
```

---

## Security & Authorization

```
+-----------------------------------------------------------+
|                  SECURITY MODEL                         |
|                                                         |
|  +------------------------------------------------+       |
|  |           Authentication Layer                |       |
|  |  +-------------------------------------------+  |       |
|  |  |  DemoAuthGuard                          |  |       |
|  |  |  |--- Verifies JWT token                 |  |       |
|  |  |  |--- Extracts user from request         |  |       |
|  |  |  `--- Attaches user to request object    |  |       |
|  |  `-------------------------------------------+  |       |
|  `------------------------------------------------+       |
|                                                         |
|  +------------------------------------------------+       |
|  |           Authorization Layer               |       |
|  |  +-------------------------------------------+  |       |
|  |  |  POST /reports                          |  |       |
|  |  |  -> Any authenticated user               |  |       |
|  |  |------------------------------------------  |       |
|  |  |  GET /reports                           |  |       |
|  |  |  -> Admin only                           |  |       |
|  |  |------------------------------------------  |       |
|  |  |  GET /reports/:id                       |  |       |
|  |  |  -> Admin only                           |  |       |
|  |  |------------------------------------------  |       |
|  |  |  PATCH /reports/:id/status              |  |       |
|  |  |  -> Admin only                           |  |       |
|  |  `-------------------------------------------+  |       |
|  `------------------------------------------------+       |
|                                                         |
|  +------------------------------------------------+       |
|  |           Validation Layer                   |       |
|  |  +-------------------------------------------+  |       |
|  |  |  class-validator                        |  |       |
|  |  |  |--- @IsNotEmpty()                      |  |       |
|  |  |  |--- @IsUUID()                          |  |       |
|  |  |  `--- @IsEnum(ReportReason)              |  |       |
|  |  `-------------------------------------------+  |       |
|  `------------------------------------------------+       |
`-----------------------------------------------------------+
```

---

## Enum Values

### ReportReason

```
+--------------------------------------------------------------+
|     Enum Value          |         Description              |
|--------------------------+----------------------------------
| spam                    | Spam content                     |
| harassment              | Harassment, bullying             |
| inappropriate_content   | Inappropriate content            |
| fake_profile            | Fake account                     |
| underage                | Underage user                    |
| other                   | Other reason                     |
`--------------------------------------------------------------+
```

### ReportStatus

```
+--------------------------------------------------------------+
|     Enum Value          |         Description              |
|--------------------------+----------------------------------
| pending                 | Pending                          |
| reviewed                | Reviewed                         |
| resolved                | Resolved                         |
| rejected                | Rejected                         |
`--------------------------------------------------------------+
```

---

## Dependencies

```
Backend:
|--- @nestjs/common         -> Controller decorators, Guards
|--- @nestjs/typeorm        -> TypeORM integration
|--- typeorm                -> ORM for PostgreSQL
|--- class-validator        -> DTO validation
|--- @nestjs/jwt            -> JWT authentication
`--- pg                     -> PostgreSQL driver

Frontend:
|--- @radix-ui/themes       -> UI components (Card, Flex, Text, etc.)
|--- next                   -> React framework
|--- react                  -> UI library
`--- @/contexts/ThemeContext -> Theme state management
```

---

## Testing Strategy

```
+-----------------------------------------------------------+
|                  TESTING                                 |
|                                                         |
|  Unit Tests                                             |
|  |--- ReportService.spec.ts                              |
|  |   |--- create() - success                             |
|  |   |--- create() - invalid DTO                         |
|  |   |--- findAllForAdmin() - success                    |
|  |   |--- findOneForAdmin() - not found                  |
|  |   |--- updateStatus() - success                       |
|  |   `--- updateStatus() - unauthorized                  |
|  `--- ReportController.spec.ts                           |
|      |--- POST / - validation                            |
|      |--- GET / - admin only                             |
|      |--- GET /:id - admin only                          |
|      `--- PATCH /:id/status - admin only                 |
|                                                         |
|  E2E Tests                                              |
|  |--- Create report flow                                |
|  |--- Admin review flow                                  |
|  `--- Status update flow                                 |
|                                                         |
|  Frontend Tests                                         |
|  |--- ReportForm.test.tsx                                |
|  |--- ReportStats.test.tsx                               |
|  `--- ReportHistory.test.tsx                             |
`-----------------------------------------------------------+
```

---

## Future Improvements

```
+-----------------------------------------------------------+
|              FUTURE ENHANCEMENTS                        |
|                                                         |
|  1. Real-time notifications                             |
|     `--- WebSocket for new reports                       |
|                                                         |
|  2. Email notifications                                 |
|     `--- Notify admin on new report                      |
|     `--- Notify reporter on status change                |
|                                                         |
|  3. Report categories                                   |
|     `--- Configurable from admin panel                   |
|                                                         |
|  4. Attachments support                                 |
|     `--- Screenshots, chat logs                          |
|                                                         |
|  5. Analytics dashboard                                 |
|     `--- Charts and graphs                               |
|     `--- Export to CSV/PDF                               |
|                                                         |
|  6. Rate limiting                                       |
|     `--- Max 5 reports/minute per user                   |
|     `--- Max 50 reports/day per user                     |
|                                                         |
|  7. Appeal system                                       |
|     `--- Users can appeal resolved reports               |
|                                                         |
|  8. AI-powered triage                                   |
|     `--- Auto-categorize reports                         |
|     `--- Priority scoring                                |
`-----------------------------------------------------------+
```

---

## Quick Reference

### Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/chat_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
PORT=3000
```

### Common Commands

```bash
# Run backend
pnpm run start:dev

# Run tests
pnpm run test

# Run migrations
pnpx typeorm migration:run

# Generate new migration
pnpx typeorm migration:create -n ReportStatusUpdate
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/report-system

# Commit changes
git add .
git commit -m "feat: add report system with admin management"

# Push to remote
git push origin feature/report-system

# Create PR on GitHub
```

---

*Document created on 10/05/2026*
