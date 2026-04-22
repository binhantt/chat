# API CONNECT GUIDE

## 1) ENV can co
Tham khao `.env.example`:
- `PORT`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `COOKIE_SECURE`, `COOKIE_DOMAIN`

## 2) Endpoints chinh
- Health:
  - `GET /health`
- Auth:
  - `POST /api/auth/google-login`
  - `POST /api/auth/refresh-token`
  - `POST /api/auth/logout`
- Chat:
  - `POST /api/chat/messages`
  - `GET /api/chat/rooms/:roomId/history`

## 3) Cac cach auth khi goi chat API
### Cach A - Bearer token
- Header:
  - `Authorization: Bearer <access_token>`

### Cach B - Cookie auth
- Cookie tu login:
  - `access_token`
  - `refresh_token`
- Middleware se verify:
  - access token hop le
  - refresh token hop le
  - cap token cung `userId` (kiem tra toan ven session)

## 4) Google login trang thai hien tai
- Demo mode da hoat dong:
  - idToken dung format:
  - `demo:<googleId>:<email>:<name>`
- Verify Google token that:
  - chua trien khai day du (dang fail co chu thich ro trong code)

## 5) Khoi tao DB nhanh
1. `npm install`
2. `npm run db:setup`
3. Xac nhan bang duoc tao:
   - `users`
   - `rooms`
   - `messages`

## 6) Loi thuong gap
- `401 Access token is required`:
  - quen Bearer hoac cookie.
- `Session integrity check failed`:
  - cookie `access_token` va `refresh_token` khong cung phien.
- `GOOGLE_CLIENT_ID is missing`:
  - chua set bien moi truong Google.
