# Tai lieu bien moi truong

Tai lieu nay gom cac bien `.env` dang duoc frontend va backend su dung. Khong commit file `.env` that neu co secret san pham; chi commit `.env.example`.

## Muc luc

- [File lien quan](#file-lien-quan)
- [Bien dung chung](#bien-dung-chung)
- [Backend `.env`](#backend-env)
- [Frontend `.env`](#frontend-env)
- [Luu y bao mat](#luu-y-bao-mat)

## File lien quan

- `backend/.env`: cau hinh chay backend tren may local.
- `backend/.env.example`: mau bien moi truong backend.
- `Frontend/.env`: cau hinh chay frontend tren may local.
- `Frontend/.env.example`: mau bien moi truong frontend.
- `Frontend/lib/env.ts`: noi gom bien dung chung o frontend, vi du `BACKEND_URL` va `APP_URL`.
- `backend/src/database/postgres.config.ts`: doc bien ket noi PostgreSQL.
- `backend/src/security/security.config.ts`: doc bien CORS va frontend URL.
- `backend/src/auth/services/auth-token.service.ts`: doc secret ky access/refresh token.
- `backend/src/auth/services/google-auth.service.ts`: doc Google client id.
- `backend/src/analytics/analytics.service.ts`: doc `ANALYTICS_SALT`.

## Bien dung chung

| Bien | Noi dung | Vi du local |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | URL frontend public | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | URL site dung cho sitemap/metadata | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | URL backend NestJS | `http://localhost:3001` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID cho frontend | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth Web Client ID cho backend verify token | `xxx.apps.googleusercontent.com` |

`NEXT_PUBLIC_API_URL` phai khop voi backend `PORT`. Mac dinh backend chay `3001`, frontend chay `3000`.

## Backend `.env`

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=chat
DB_SSL=false
DB_BOOTSTRAP_SCHEMA=false
PERFORMANCE_INDEXES=true
ANALYTICS_SALT=change-me-local-analytics-salt

AUTH_TOKEN_SECRET=change-me-local-auth-token-secret
ACCESS_TOKEN_SECRET=change-me-local-access-token-secret
REFRESH_TOKEN_SECRET=change-me-local-refresh-token-secret

GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456
```

Neu dung connection string PostgreSQL, co the thay nhom `DB_*` bang:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chat
```

## Frontend `.env`

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
NEXT_DIST_DIR=.next
```

## Luu y bao mat

- Production phai doi tat ca secret: `AUTH_TOKEN_SECRET`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ANALYTICS_SALT`.
- `ADMIN_PASSWORD` khong dung mat khau mac dinh khi deploy.
- `CORS_ORIGINS` chi khai bao domain frontend that, khong dung `*`.
- Cac bien bat dau bang `NEXT_PUBLIC_` se duoc expose ra browser, khong dat secret vao nhom nay.
