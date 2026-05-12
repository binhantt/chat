# ChatApp Frontend

Frontend của ChatApp được xây bằng Next.js, React, Radix UI và Tailwind CSS.

## Chạy development

```bash
npm install
npm run dev
```

Mặc định frontend chạy ở `http://localhost:3000`.

## Biến môi trường

Tạo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Vai trò frontend

- Hiển thị UI cho user và admin.
- Gọi backend API thông qua API client hoặc `app/api/...` proxy route.
- Quản lý auth state ở client.
- Hiển thị chat, matching, profile, report và admin dashboard.

## Nguyên tắc API

- Backend NestJS là nguồn nghiệp vụ chính.
- Frontend API route chỉ nên proxy/adapter request.
- Không lặp logic matching, chat, report hoặc moderation ở frontend.

Xem thêm: [`../docs/API-CONTRACT.md`](../docs/API-CONTRACT.md).
