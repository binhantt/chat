#  Bao Cao He Thong - Tai Lieu Ky Thuat

## Tong Quan

He thong bao cao cho phep nguoi dung gui bao cao ve cac van de (spam, quay roi, noi dung khong phu hop...) va cho phep admin quan ly, xem xet cac bao cao nay.

## Kien Truc He Thong

```
+-----------------------------------------------------------+
|                    FRONTEND (Next.js)                    |
|  +------------+  +-------------+  +------------------------+  |
|  | ReportForm|  |ReportStats|  | ReportHistory        |  |
|  | Gui bao  |  | Thong ke |  | Lich su bao cao     |  |
|  | cao      |  |           |  |                      |  |
|  `------------+  `-------------+  `------------------------+  |
|       |              |                    |              |
|       `---------------+---------------------+              |
|                      | REST API                         |
|-----------------------+-----------------------------------
|                    BACKEND (NestJS)                      |
|  +------------------------------------------------------+  |
|  |  ReportController  (Xu ly HTTP request)           |  |
|  |  |--- POST /reports        - Tao bao cao moi       |  |
|  |  |--- GET  /reports        - Lay tat ca (admin)     |  |
|  |  |--- GET  /reports/:id    - Lay theo ID (admin)    |  |
|  |  `--- PATCH /reports/:id   - Cap nhat trang thai   |  |
|  `------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  |  ReportService  (Business Logic)                   |  |
|  |  |--- create()         - Tao bao cao                |  |
|  |  |--- findAllForAdmin()- Lay tat ca cho admin       |  |
|  |  |--- findOneForAdmin()- Lay 1 bao cao cho admin    |  |
|  |  `--- updateStatus()   - Cap nhat trang thai        |  |
|  `------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  |  Database (PostgreSQL + TypeORM)                   |  |
|  |  `--- Table: reports                                 |  |
|  `------------------------------------------------------+  |
`-----------------------------------------------------------+
```

## Cau Truc Thu Muc

```
backend/src/report/
|--- report.controller.ts    # Controller - Xu ly HTTP request
|--- report.service.ts       # Service - Business logic
|--- report.module.ts        # Module - Dang ky dependencies
|--- entities/
|   `--- report.entity.ts    # Entity - Cau truc bang database
|--- dto/
|   `--- create-report.dto.ts # DTO - Data Transfer Object
`--- interfaces/
    `--- (neu co)
```

## API Endpoints

### 1. Tao Bao Cao Moi

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
  "reportedUserId": "uuid-cua-nguoi-bi-bao-cao",
  "reason": "spam | harassment | inappropriate_content | fake_profile | underage | other",
  "description": "Mo ta chi tiet (tuy chon)"
}
```

**Response (201 - Created):**
```json
{
  "id": "uuid-bao-cao",
  "reporterId": "uuid-nguoi-gui",
  "reportedUserId": "uuid-nguoi-bi-bao-cao",
  "reason": "spam",
  "description": "Mo ta chi tiet",
  "status": "pending",
  "createdAt": "2026-05-10T10:00:00.000Z"
}
```

**Loi co the xay ra:**
```json
// 400 - Du lieu khong hop le
{
  "message": "Validation failed",
  "errors": ["reportedUserId must be a UUID"]
}

// 401 - Chua dang nhap
{
  "message": "Unauthorized"
}
```

---

### 2. Lay Tat Ca Bao Cao (Chi Admin)

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
    "id": "uuid-bao-cao",
    "reason": "spam",
    "description": "Mo ta",
    "status": "pending",
    "createdAt": "2026-05-10T10:00:00.000Z",
    "reporter": {
      "id": "uuid",
      "fullName": "Nguoi gui",
      "email": "sender@example.com"
    },
    "reportedUser": {
      "id": "uuid",
      "fullName": "Nguoi bi bao cao",
      "email": "reported@example.com"
    },
    "recentPartners": [
      {
        "id": "uuid",
        "fullName": "Doi tac gan day",
        "avatarUrl": "https://..."
      }
    ]
  }
]
```

**Loi:**
```json
// 403 - Khong phai admin
{
  "message": "Chi admin moi co quyen xem bao cao"
}
```

---

### 3. Lay Bao Cao Theo ID (Chi Admin)

```
GET /api/reports/:id
```

**Response (200 - Success):**
```json
{
  "id": "uuid-bao-cao",
  "reason": "harassment",
  "description": "Mo ta chi tiet",
  "status": "reviewed",
  "createdAt": "2026-05-10T10:00:00.000Z",
  "reporter": {
    "id": "uuid",
    "fullName": "Nguoi gui",
    "email": "sender@example.com"
  },
  "reportedUser": {
    "id": "uuid",
    "fullName": "Nguoi bi bao cao",
    "email": "reported@example.com"
  },
  "recentPartners": []
}
```

**Loi:**
```json
// 404 - Khong tim thay
{
  "message": "Report not found"
}
```

---

### 4. Cap Nhat Trang Thai Bao Cao (Chi Admin)

```
PATCH /api/reports/:id/status
```

**Request Body:**
```json
{
  "status": "reviewed"
}
```

**Gia tri status hop le:**
- `pending` - Cho xu ly
- `reviewed` - Da xem xet
- `resolved` - Da giai quyet
- `rejected` - Bi tu choi

**Response (200 - Success):**
```json
{
  "id": "uuid-bao-cao",
  "reason": "spam",
  "description": "Mo ta",
  "status": "reviewed",
  "createdAt": "2026-05-10T10:00:00.000Z",
  "updatedAt": "2026-05-10T11:00:00.000Z"
}
```

---

## Cac Gia Tri Enum

### ReportReason (Ly do bao cao)

| Gia tri | Mo ta |
|---------|-------|
| `spam` | Noi dung spam |
| `harassment` | Quay roi |
| `inappropriate_content` | Noi dung khong phu hop |
| `fake_profile` | Tai khoan gia mao |
| `underage` | Nguoi dung chua du tuoi |
| `other` | Khac |

### ReportStatus (Trang thai bao cao)

| Gia tri | Mo ta |
|---------|-------|
| `pending` | Cho xu ly |
| `reviewed` | Da xem xet |
| `resolved` | Da giai quyet |
| `rejected` | Bi tu choi |

---

## Data Models

### CreateReportDto
```typescript
export class CreateReportDto {
  @IsNotEmpty()
  @IsUUID()
  reportedUserId!: string;  // UUID cua nguoi bi bao cao

  @IsNotEmpty()
  @IsEnum(ReportReason)
  reason!: ReportReason;    // Ly do bao cao

  @IsOptional()
  @IsString()
  description?: string;     // Mo ta chi tiet (tuy chon)
}
```

### Report (Entity)
```typescript
@Entity('reports')
export class Report {
  id: string;              // UUID - Khoa chinh
  reporterId: string;      // UUID nguoi gui bao cao
  reportedUserId: string;  // UUID nguoi bi bao cao
  reason: ReportReason;    // Ly do bao cao
  description: string;     // Mo ta chi tiet
  status: ReportStatus;    // Trang thai
  createdAt: Date;         // Thoi gian tao
  updatedAt: Date;         // Thoi gian cap nhat
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

## Quy Trinh Xu Ly

### Nguoi Dung Gui Bao Cao
```
1. Nguoi dung chon "Bao cao" tren giao dien
2. Chon ly do (spam, quay ro, loi...)
3. Nhap mo ta chi tiet
4. Nhan "Gui bao cao"
5. Frontend goi POST /api/reports
6. Backend luu vao database voi status = "pending"
7. Hien thi thong bao gui thanh cong
```

### Admin Xem Va Xu Ly Bao Cao
```
1. Admin dang nhap vao dashboard
2. Goi GET /api/reports de xem danh sach bao cao
3. Xem chi tiet tung bao cao bang GET /api/reports/:id
4. Cap nhat trang thai:
   - "reviewed" -> Da xem xet
   - "resolved" -> Da giai quyet
   - "rejected" -> Tu choi (khong hop le)
5. Goi PATCH /api/reports/:id/status
```

---

## Bao Mat

### Xac Thuc
- Tat ca endpoint yeu cau authentication (JWT token)
- Su dung `DemoAuthGuard` de xac thuc

### Phan Quyen
- **Nguoi dung thuong**: Chi co the tao bao cao moi
- **Admin**: Co the xem tat ca bao cao va cap nhat trang thai

### Validation
- Su dung `class-validator` de validate input
- `reportedUserId` phai la UUID hop le
- `reason` phai la mot trong cac gia tri enum

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
- Form gui bao cao moi
- Chon loai bao cao (bug, suggest, abuse, other)
- Nhap tieu de va noi dung
- Goi API POST /api/reports

### ReportStats.tsx
- Hien thi thong ke bao cao
- Tong bao cao, cho xu ly, da xem xet, da giai quyet
- Goi API GET /api/reports/stats

### ReportHistory.tsx
- Hien thi lich su bao cao cua nguoi dung
- Goi API GET /api/reports/my-reports
- Hien thi trang thai voi Badge mau

### AdminReportManagement.tsx
- Dashboard quan ly bao cao cho admin
- Xem danh sach tat ca bao cao
- Cap nhat trang thai bao cao
- Goi API GET/PUT/PATCH /api/reports

---

## Rate Limiting

De ngan chan lam dung:
- **Nguoi dung thuong**: Toi da 5 bao cao/phut, 50 bao cao/ngay
- **Admin**: Khong gioi han

---

## Error Codes

| Code | Mo ta |
|------|-------|
| 400 | Du lieu khong hop le (validation failed) |
| 401 | Chua dang nhap (Unauthorized) |
| 403 | Khong co quyen (Forbidden - chi admin) |
| 404 | Bao cao khong ton tai |
| 500 | Loi server noi bo |

---

## Vi Du Su Dung

### Tao Bao Cao (JavaScript)
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

### Lay Danh Sach Bao Cao Admin (JavaScript)
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

### Cap Nhat Trang Thai (JavaScript)
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

## Lich Su Phat Trien

| Ngay | Mo ta |
|------|-------|
| 2026-05-10 | Tao tai lieu documentation dau tien |
| 2026-05-10 | Them API endpoints cho frontend |
| 2026-05-10 | Tao mock API routes cho development |

---

## Lien Ket

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Report API Spec](./report-api.md)

---

*Tai lieu duoc tao ngay 10/05/2026*