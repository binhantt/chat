# DOC 06 - Bao mat

Cap nhat: 30/05/2026

Tai lieu nay ghi cac lop bao ve hien co va cac quy tac can giu khi phat trien tiep du an Chat/Nguoi La.

## Muc tieu

- Bao ve phien dang nhap bang cookie va token.
- Tach khu vuc nguoi dung va khu vuc quan ly.
- Chan request gia mao CSRF tren cac method ghi du lieu.
- Khong lo thong tin nhay cam qua localStorage, payload API hoac log.
- Giam rui ro query qua nang lam cham hoac treo server.

## Auth va token

Backend phu trach auth trong `backend/src/auth`.

- Access token luu trong cookie `access_token`.
- Refresh token luu trong cookie `refresh_token`.
- `access_token` va `refresh_token` dung `HttpOnly`.
- Cookie dung `sameSite: "strict"`.
- Cookie chi bat `secure` khi `NODE_ENV=production`.
- Cookie `user_id` va `csrf_token` khong `HttpOnly` de frontend/proxy doc khi can.
- Khi logout phai clear: `access_token`, `refresh_token`, `user_id`, `csrf_token`.

Quy tac can giu:

- Khong luu user hien tai, access token, refresh token trong `localStorage`.
- Khong dua object user lon vao JWT.
- JWT payload chi nen gom thong tin toi thieu nhu `sub` va quyen neu backend can.
- Refresh access token chi khi access token loi/het han, khong goi lien tuc.
- Neu refresh token het han thi clear cookie va dua ve login.
- Neu tai khoan bi khoa thi thoat phien ngay, khong tiep tuc dung cookie cu.

## Manager/admin

Du an dung route quan ly dang `manager`, tranh lo truc tiep chu `admin` o API moi.

- Frontend page: `/admin/*`.
- Frontend proxy API: `/api/v1/manager/*`.
- Backend controller: `/api/v1/manager/*`.
- Login quan ly: `POST /api/v1/manager/login`.

Quy tac:

- Chi user co role quan ly moi vao duoc endpoint manager.
- UI co the an nut theo quyen, nhung backend van phai check quyen that.
- Khong tin vao role tu localStorage hoac state frontend.
- Khong tra password hash, token, refresh session trong API danh sach user.

## CSRF

Backend co origin guard va CSRF trong `backend/src/security/security.config.ts`.

Co che:

- Cac method nguy hiem: `POST`, `PUT`, `PATCH`, `DELETE`.
- Cookie `csrf_token` phai khop header `x-csrf-token`.
- Login va refresh nam trong danh sach exempt de tao/lam moi phien.
- Proxy Next noi bo co header `x-internal-api-proxy: next`.

Route duoc mien CSRF hien tai:

- `/api/v1/auth/google-login`
- `/api/v1/auth/email-login`
- `/api/v1/auth/refresh`
- `/api/v1/manager/login`

Quy tac:

- Khong them route ghi du lieu vao exempt neu khong can.
- Moi request ghi du lieu tu frontend phai gui `x-csrf-token`.
- Khi gap loi `CSRF token invalid or missing`, frontend chi refresh phien mot lan roi retry, tranh loop vo han.

## CORS va security headers

Backend gioi han origin trong `getAllowedOrigins()`.

Origin mac dinh cho dev:

- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3001`
- `http://localhost:5173`
- `http://127.0.0.1:5173`

Header bao ve dang co:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Cross-Origin-Opener-Policy: same-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'`
- Production co `Strict-Transport-Security`.

Quy tac deploy:

- Set `FRONTEND_URL` dung domain that.
- Set `CORS_ORIGINS` neu co nhieu domain.
- Khong de `*` cho CORS production.
- Bat HTTPS de cookie `secure` co tac dung.

## Input va noi dung chat

Backend co `backend/src/security/input-sanitization.pipe.ts` va module conduct.

Quy tac:

- Validate DTO cho moi payload.
- Trim/sanitize string truoc khi luu.
- Gioi han do dai content tin nhan, tieu de bao cao, bio, note.
- Tin nhan can chay qua conduct rules de phat hien noi dung vi pham.
- Khong render HTML tu user input tren frontend.

## Bao cao va khoa tai khoan

Khi bao cao duoc xac nhan vi pham:

- Backend cap nhat report status.
- Backend khoa user bi bao cao theo lock type.
- User bi khoa phai bi day ra khoi phien dang nhap.
- Khi mo khoa tu report, chi mo neu report do dang la nguon khoa.

Quy tac:

- Khong chi khoa o frontend.
- Khong cho user tu mo khoa minh bang API user thuong.
- Log hanh dong quan ly quan trong neu them audit sau nay.

## Database va API

Bao mat cung la tranh endpoint bi lam cham de tan cong.

Quy tac:

- Endpoint danh sach phai dung `limit`.
- Danh sach lon dung cursor pagination, khong dung offset lon.
- Chi select field can thiet, khong `SELECT *`.
- Tranh N+1 query trong loop.
- Them index theo query thuc te.
- Gioi han `limit` toi da tren backend.

Index quan trong:

- `messages(room_id, created_at DESC)`
- `messages(user_id, created_at DESC)`
- `conversations(status, updated_at, id)`
- `reports(status, created_at, id)`
- `users(created_at, id)`

## Log

Duoc log:

- Method, path, thoi gian request.
- Login timing tach `db`, `password`, `token`.
- Loi he thong khong chua secret.

Khong duoc log:

- Password.
- Access token.
- Refresh token.
- Cookie day du.
- Google id token.
- Noi dung chat nhay cam neu khong can debug cuc bo.

## Checklist truoc khi deploy

- `NODE_ENV=production`.
- `FRONTEND_URL` dung domain production.
- `CORS_ORIGINS` chi gom domain hop le.
- `JWT_SECRET` va refresh secret khong dung gia tri dev.
- HTTPS bat tren domain.
- Cookie secure hoat dong.
- Database da co index hieu nang.
- Build frontend/backend pass.
- Khong con token/user nhay cam trong localStorage.
- Route manager da check quyen backend.
- CSRF khong bi tat rong.

## File lien quan

- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/services/auth-cookie.service.ts`
- `backend/src/auth/services/auth-token.service.ts`
- `backend/src/auth/guards/demo-auth.guard.ts`
- `backend/src/security/security.config.ts`
- `backend/src/security/input-sanitization.pipe.ts`
- `Frontend/app/api/_utils/backendHeaders.ts`
- `Frontend/features/athu/api/adminApi.ts`
