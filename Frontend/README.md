# ChatApp Frontend

Frontend cua ChatApp duoc xay bang Next.js, React, Radix UI va Tailwind CSS.

## Chay development

```bash
npm install
npm run dev
```

Mac dinh frontend chay o `http://localhost:3000`.

## Bien moi truong

Tao `.env` hoac `.env.local` tu file mau:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

Chi tiet bien moi truong: [`../DOC_07_ENV.md`](../DOC_07_ENV.md).

## Vai tro frontend

- Hien thi UI cho user va admin.
- Goi backend API thong qua API client hoac `app/api/...` proxy route.
- Quan ly auth state o client.
- Hien thi chat, matching, profile, report va admin dashboard.

## Nguyen tac API

- Backend NestJS la nguon nghiep vu chinh.
- Frontend API route chi nen proxy/adapter request.
- Khong lap logic matching, chat, report hoac moderation o frontend.

Xem them: [`../docs/API-CONTRACT.md`](../docs/API-CONTRACT.md).
