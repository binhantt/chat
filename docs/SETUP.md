# ChatApp Setup

ChatApp gồm hai phần chạy song song:

- `frontend`: Next.js, React, Radix UI, Tailwind CSS.
- `backend`: NestJS, TypeORM, PostgreSQL, JWT/auth, matching, chat, report, admin.

## Yêu cầu

- Node.js 18+.
- PostgreSQL.
- `npm` cho frontend.
- `pnpm` cho backend.

## Cài đặt frontend

```bash
cd frontend
npm install
```

Tạo file `.env.local` nếu chưa có:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Chạy frontend:

```bash
npm run dev
```

Frontend mặc định chạy ở `http://localhost:3000`.

## Cài đặt backend

```bash
cd backend
pnpm install
```

Tạo file `.env`:

```env
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/chat_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

Chạy backend:

```bash
pnpm run start:dev
```

## Luồng chạy đề xuất

1. Khởi động PostgreSQL.
2. Chạy backend ở `http://localhost:3001`.
3. Chạy frontend ở `http://localhost:3000`.
4. Đăng ký hoặc đăng nhập để kiểm tra auth, profile, match, chat và report.

## Việc cần kiểm tra sau khi setup

- Đăng nhập email/password.
- Đăng nhập Google nếu đã cấu hình OAuth.
- Cập nhật hồ sơ người dùng.
- Tìm người để chat.
- Ghép đôi theo thành phố và giới tính.
- Gửi và xem tin nhắn.
- Tạo report.
- Đăng nhập admin và xử lý user/chat/report.
