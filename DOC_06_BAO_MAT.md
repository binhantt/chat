# DOC 06 - Security

Updated: 30/05/2026

This document records the existing protection layers and rules to maintain when continuing development of the Chat/Stranger project.

## Goals

- Protect login sessions with cookies and tokens.
- Separate user area and management area.
- Block CSRF forgery requests on write methods.
- Don't leak sensitive information via localStorage, API payload, or logs.
- Reduce risk of heavy queries slowing down or crashing the server.

## Auth and Token

Backend handles auth in `backend/src/auth`.

- Access token stored in cookie `access_token`.
- Refresh token stored in cookie `refresh_token`.
- `access_token` and `refresh_token` use `HttpOnly`.
- Cookie uses `sameSite: "strict"`.
- Cookie `secure` is only enabled when `NODE_ENV=production`.
- Cookie `user_id` and `csrf_token` are not `HttpOnly` so frontend/proxy can read them when needed.
- On logout, must clear: `access_token`, `refresh_token`, `user_id`, `csrf_token`.

Rules to maintain:

- Don't store current user, access token, refresh token in `localStorage`.
- Don't put large user objects in JWT.
- JWT payload should only contain minimal info like `sub` and permissions if backend needs them.
- Only refresh access token when it fails/expires, not continuously.
- If refresh token expires, clear cookie and redirect to login.
- If account is locked, end session immediately, don't continue using old cookie.

## Manager/Admin

The project uses `manager` routing to avoid exposing the word `admin` directly in APIs.

- Frontend page: `/admin/*`.
- Frontend proxy API: `/api/v1/manager/*`.
- Backend controller: `/api/v1/manager/*`.
- Manager login: `POST /api/v1/manager/login`.

Rules:

- Only users with manager role can access manager endpoints.
- UI can hide buttons based on permissions, but backend must still check permissions.
- Don't trust roles from localStorage or frontend state.
- Don't return password hash, token, or refresh session in user list API.

## CSRF

Backend has origin guard and CSRF in `backend/src/security/security.config.ts`.

Mechanism:

- Dangerous methods: `POST`, `PUT`, `PATCH`, `DELETE`.
- Cookie `csrf_token` must match header `x-csrf-token`.
- Login and refresh are in the exempt list for session creation/refresh.
- Internal Next proxy has header `x-internal-api-proxy: next`.

Routes currently exempt from CSRF:

- `/api/v1/auth/google-login`
- `/api/v1/auth/email-login`
- `/api/v1/auth/refresh`
- `/api/v1/manager/login`

Rules:

- Don't add write routes to exempt list if not needed.
- Every write request from frontend must send `x-csrf-token`.
- When encountering `CSRF token invalid or missing` error, frontend should only refresh session once then retry, avoiding infinite loops.

## CORS and Security Headers

Backend restricts origins in `getAllowedOrigins()`.

Default origins for dev:

- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3001`
- `http://localhost:5173`
- `http://127.0.0.1:5173`

Current protection headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Cross-Origin-Opener-Policy: same-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'`
- Production has `Strict-Transport-Security`.

Deploy rules:

- Set `FRONTEND_URL` to the real domain.
- Set `CORS_ORIGINS` if there are multiple domains.
- Don't use `*` for production CORS.
- Enable HTTPS for `secure` cookie to take effect.

## Input and Chat Content

Backend has `backend/src/security/input-sanitization.pipe.ts` and conduct module.

Rules:

- Validate DTO for every payload.
- Trim/sanitize strings before saving.
- Limit content length for messages, report titles, bios, notes.
- Messages must pass through conduct rules to detect violating content.
- Don't render HTML from user input on frontend.

## Reports and Account Lock

When a report is confirmed as a violation:

- Backend updates report status.
- Backend locks the reported user based on lock type.
- Locked user must be kicked out of the login session.
- When unlocking from a report, only unlock if that report was the source of the lock.

Rules:

- Don't only lock at frontend level.
- Don't let users unlock themselves via regular user API.
- Log important management actions if adding audit later.

## Database and API

Security also means preventing endpoints from being slowed down as an attack vector.

Rules:

- List endpoints must use `limit`.
- Large lists use cursor pagination, not large offsets.
- Only select needed fields, no `SELECT *`.
- Avoid N+1 queries in loops.
- Add indexes based on actual queries.
- Enforce max `limit` on backend.

Important indexes:

- `messages(room_id, created_at DESC)`
- `messages(user_id, created_at DESC)`
- `conversations(status, updated_at, id)`
- `reports(status, created_at, id)`
- `users(created_at, id)`

## Logging

Logged:

- Method, path, request duration.
- Login timing split into `db`, `password`, `token`.
- System errors without secrets.

Not logged:

- Password.
- Access token.
- Refresh token.
- Full cookie.
- Google ID token.
- Sensitive chat content unless needed for local debugging.

## Pre-Deploy Checklist

- `NODE_ENV=production`.
- `FRONTEND_URL` points to production domain.
- `CORS_ORIGINS` only includes valid domains.
- `JWT_SECRET` and refresh secret not using dev values.
- HTTPS enabled on domain.
- Cookie secure is working.
- Database has performance indexes.
- Frontend/backend build passes.
- No sensitive tokens/users in localStorage.
- Manager routes have backend permission checks.
- CSRF is not broadly disabled.

## Related Files

- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/services/auth-cookie.service.ts`
- `backend/src/auth/services/auth-token.service.ts`
- `backend/src/auth/guards/demo-auth.guard.ts`
- `backend/src/security/security.config.ts`
- `backend/src/security/input-sanitization.pipe.ts`
- `Frontend/app/api/_utils/backendHeaders.ts`
- `Frontend/features/athu/api/adminApi.ts`
