# 📋 Báo Cáo Hệ Thống - Tài Liệu Kỹ Thuật

## Tổng Quan

Hệ thống báo cáo cho phép người dùng gửi báo cáo về các vấn đề (spam, quấy rối, nội dung không phù hợp...) và cho phép admin quản lý, xem xét các báo cáo này.

## Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐  │
│  │ ReportForm│  │ReportStats│  │ ReportHistory        │  │
│  │ Gửi báo  │  │ Thống kê │  │ Lịch sử báo cáo     │  │
│  │ cáo      │  │           │  │                      │  │
│  └────┬─────┘  └─────┬─────┘  └──────────┬───────────┘  │
│       │              │                    │              │
│       └──────────────┼────────────────────┘              │
│                      │ REST API                         │
├──────────────────────┼───────────────────────────────────┤
│                    BACKEND (NestJS)                      │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ReportController  (Xử lý HTTP request)           │  │
│  │  ├── POST /reports        - Tạo báo cáo mới       │  │
│  │  ├── GET  /reports        - Lấy tất cả (admin)     │  │
│  │  ├── GET  /reports/:id    - Lấy theo ID (admin)    │  │
│  │  └── PATCH /reports/:id   - Cập nhật trạng thái   │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ReportService  (Business Logic)                   │  │
│  │  ├── create()         - Tạo báo cáo                │  │
│  │  ├── findAllForAdmin()- Lấy tất cả cho admin       │  │
│  │  ├── findOneForAdmin()- Lấy 1 báo cáo cho admin    │  │
│  │  └── updateStatus()   - Cập nhật trạng thái        │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Database (PostgreSQL + TypeORM)                   │  │
│  │  └── Table: reports                                 │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Cấu Trúc Thư Mục

```
backend/src/report/
├── report.controller.ts    # Controller - Xử lý HTTP request
├── report.service.ts       # Service - Business logic
├── report.module.ts        # Module - Đăng ký dependencies
├── entities/
│   └── report.entity.ts    # Entity - Cấu trúc bảng database
├── dto/
│   └── create-report.dto.ts # DTO - Data Transfer Object
└── interfaces/
    └── (nếu có)
```

## API Endpoints

### 1. Tạo Báo Cáo Mới

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
  "reportedUserId": "uuid-của-người-bị-báo-cáo",
  "reason": "spam | harassment | inappropriate_content | fake_profile | underage | other",
  "description": "Mô tả chi tiết (tuỳ chọn)"
}
```

**Response (201 - Created):**
```json
{
  "id": "uuid-báo-cáo",
  "reporterId": "uuid-người-gửi",
  "reportedUserId": "uuid-người-bị-báo-cáo",
  "reason": "spam",
  "description": "Mô tả chi tiết",
  "status": "pending",
  "createdAt": "2026-05-10T10:00:00.000Z"
}
```

**Lỗi có thể xảy ra:**
```json
// 400 - Dữ liệu không hợp lệ
{
  "message": "Validation failed",
  "errors": ["reportedUserId must be a UUID"]
}

// 401 - Chưa đăng nhập
{
  "message": "Unauthorized"
}
```

---

### 2. Lấy Tất Cả Báo Cáo (Chỉ Admin)

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
    "id": "uuid-báo-cáo",
    "reason": "spam",
    "description": "Mô tả",
    "status": "pending",
    "createdAt": "2026-05-10T10:00:00.000Z",
    "reporter": {
      "id": "uuid",
      "fullName": "Người gửi",
      "email": "sender@example.com"
    },
    "reportedUser": {
      "id": "uuid",
      "fullName": "Người bị báo cáo",
      "email": "reported@example.com"
    },
    "recentPartners": [
      {
        "id": "uuid",
        "fullName": "Đối tác gần đây",
        "avatarUrl": "https://..."
      }
    ]
  }
]
```

**Lỗi:**
```json
// 403 - Không phải admin
{
  "message": "Chỉ admin mới có quyền xem báo cáo"
}
```

---

### 3. Lấy Báo Cáo Theo ID (Chỉ Admin)

```
GET /api/reports/:id
```

**Response (200 - Success):**
```json
{
  "id": "uuid-báo-cáo",
  "reason": "harassment",
  "description": "Mô tả chi tiết",
  "status": "reviewed",
  "createdAt": "2026-05-10T10:00:00.000Z",
  "reporter": {
    "id": "uuid",
    "fullName": "Người gửi",
    "email": "sender@example.com"
  },
  "reportedUser": {
    "id": "uuid",
    "fullName": "Người bị báo cáo",
    "email": "reported@example.com"
  },
  "recentPartners": []
}
```

**Lỗi:**
```json
// 404 - Không tìm thấy
{
  "message": "Report not found"
}
```

---

### 4. Cập Nhật Trạng Thái Báo Cáo (Chỉ Admin)

```
PATCH /api/reports/:id/status
```

**Request Body:**
```json
{
  "status": "reviewed"
}
```

**Giá trị status hợp lệ:**
- `pending` - Chờ xử lý
- `reviewed` - Đã xem xét
- `resolved` - Đã giải quyết
- `rejected` - Bị từ chối

**Response (200 - Success):**
```json
{
  "id": "uuid-báo-cáo",
  "reason": "spam",
  "description": "Mô tả",
  "status": "reviewed",
  "createdAt": "2026-05-10T10:00:00.000Z",
  "updatedAt": "2026-05-10T11:00:00.000Z"
}
```

---

## Các Giá Trị Enum

### ReportReason (Lý do báo cáo)

| Giá trị | Mô tả |
|---------|-------|
| `spam` | Nội dung spam |
| `harassment` | Quấy rối |
| `inappropriate_content` | Nội dung không phù hợp |
| `fake_profile` | Tài khoản giả mạo |
| `underage` | Người dùng chưa đủ tuổi |
| `other` | Khác |

### ReportStatus (Trạng thái báo cáo)

| Giá trị | Mô tả |
|---------|-------|
| `pending` | Chờ xử lý |
| `reviewed` | Đã xem xét |
| `resolved` | Đã giải quyết |
| `rejected` | Bị từ chối |

---

## Data Models

### CreateReportDto
```typescript
export class CreateReportDto {
  @IsNotEmpty()
  @IsUUID()
  reportedUserId!: string;  // UUID của người bị báo cáo

  @IsNotEmpty()
  @IsEnum(ReportReason)
  reason!: ReportReason;    // Lý do báo cáo

  @IsOptional()
  @IsString()
  description?: string;     // Mô tả chi tiết (tuỳ chọn)
}
```

### Report (Entity)
```typescript
@Entity('reports')
export class Report {
  id: string;              // UUID - Khóa chính
  reporterId: string;      // UUID người gửi báo cáo
  reportedUserId: string;  // UUID người bị báo cáo
  reason: ReportReason;    // Lý do báo cáo
  description: string;     // Mô tả chi tiết
  status: ReportStatus;    // Trạng thái
  createdAt: Date;         // Thời gian tạo
  updatedAt: Date;         // Thời gian cập nhật
}
```

### ReportWithContext (Response cho Admin)
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

## Quy Trình Xử Lý

### Người Dùng Gửi Báo Cáo
```
1. Người dùng chọn "Báo cáo" trên giao diện
2. Chọn lý do (spam, quấy rò, lỗi...)
3. Nhập mô tả chi tiết
4. Nhấn "Gửi báo cáo"
5. Frontend gọi POST /api/reports
6. Backend lưu vào database với status = "pending"
7. Hiển thị thông báo gửi thành công
```

### Admin Xem Và Xử Lý Báo Cáo
```
1. Admin đăng nhập vào dashboard
2. Gọi GET /api/reports để xem danh sách báo cáo
3. Xem chi tiết từng báo cáo bằng GET /api/reports/:id
4. Cập nhật trạng thái:
   - "reviewed" → Đã xem xét
   - "resolved" → Đã giải quyết
   - "rejected" → Từ chối (không hợp lệ)
5. Gọi PATCH /api/reports/:id/status
```

---

## Bảo Mật

### Xác Thực
- Tất cả endpoint yêu cầu authentication (JWT token)
- Sử dụng `DemoAuthGuard` để xác thực

### Phân Quyền
- **Người dùng thường**: Chỉ có thể tạo báo cáo mới
- **Admin**: Có thể xem tất cả báo cáo và cập nhật trạng thái

### Validation
- Sử dụng `class-validator` để validate input
- `reportedUserId` phải là UUID hợp lệ
- `reason` phải là một trong các giá trị enum

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

-- Index cho performance
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);
```

---

## Frontend Components

### ReportForm.tsx
- Form gửi báo cáo mới
- Chọn loại báo cáo (bug, suggest, abuse, other)
- Nhập tiêu đề và nội dung
- Gọi API POST /api/reports

### ReportStats.tsx
- Hiển thị thống kê báo cáo
- Tổng báo cáo, chờ xử lý, đã xem xét, đã giải quyết
- Gọi API GET /api/reports/stats

### ReportHistory.tsx
- Hiển thị lịch sử báo cáo của người dùng
- Gọi API GET /api/reports/my-reports
- Hiển thị trạng thái với Badge màu

### AdminReportManagement.tsx
- Dashboard quản lý báo cáo cho admin
- Xem danh sách tất cả báo cáo
- Cập nhật trạng thái báo cáo
- Gọi API GET/PUT/PATCH /api/reports

---

## Rate Limiting

Để ngăn chặn lạm dụng:
- **Người dùng thường**: Tối đa 5 báo cáo/phút, 50 báo cáo/ngày
- **Admin**: Không giới hạn

---

## Error Codes

| Code | Mô tả |
|------|-------|
| 400 | Dữ liệu không hợp lệ (validation failed) |
| 401 | Chưa đăng nhập (Unauthorized) |
| 403 | Không có quyền (Forbidden - chỉ admin) |
| 404 | Báo cáo không tồn tại |
| 500 | Lỗi server nội bộ |

---

## Ví Dụ Sử Dụng

### Tạo Báo Cáo (JavaScript)
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

### Lấy Danh Sách Báo Cáo Admin (JavaScript)
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

### Cập Nhật Trạng Thái (JavaScript)
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

## Lịch Sử Phát Triển

| Ngày | Mô tả |
|------|-------|
| 2026-05-10 | Tạo tài liệu documentation đầu tiên |
| 2026-05-10 | Thêm API endpoints cho frontend |
| 2026-05-10 | Tạo mock API routes cho development |

---

## Liên Kết

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Report API Spec](./report-api.md)

---

*Tài liệu được tạo ngày 10/05/2026*