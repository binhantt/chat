# Cau truc du an Chat

Tai lieu nay mo ta nhanh cau truc backend va giao dien hien tai de tiep tuc code khong bi lon xon.

## Tong quan

- `backend`: NestJS API, TypeORM, PostgreSQL, cookie auth.
- `Frontend`: Next.js App Router, React, Radix UI, Zustand.
- Public user API dung `/api/v1/...`.
- Khu quan ly khong public chu `admin` trong API nua, dung namespace `/api/v1/manager/...`.
- Frontend route quan ly van la `/admin/...` de nguoi dung de truy cap giao dien.

## Backend

Thu muc chinh: `backend/src`.

```text
backend/src
+-- auth
+-- chat
+-- common
+-- conduct
+-- database
+-- match
+-- report
+-- security
+-- users
+-- app.controller.ts
+-- app.module.ts
+-- main.ts
```

### `auth`

Xu ly dang nhap, refresh token, logout, cookie va Google auth.

- `auth.controller.ts`
  - `POST /api/v1/auth/google-login`
  - `POST /api/v1/auth/email-login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `POST /api/v1/manager/login`
- `auth.service.ts`: nghiep vu dang nhap.
- `services/auth-cookie.service.ts`: set, clear, refresh cookie.
- `services/auth-token.service.ts`: tao va verify access/refresh token.
- `services/google-auth.service.ts`: xac thuc Google.

### `users`

Xu ly ho so nguoi dung, quan ly nguoi dung va tai nguyen he thong.

- `user.controller.ts`
  - User:
    - `GET /api/v1/users/me`
    - `PATCH /api/v1/users/me`
    - `DELETE /api/v1/users/me`
    - `GET /api/v1/users/:id`
    - `PATCH /api/v1/users/:id`
    - `POST /api/v1/users/setup-profile`
  - Manager:
    - `GET /api/v1/manager/users`
    - `GET /api/v1/manager/users/:id`
    - `POST /api/v1/manager/users`
    - `PATCH /api/v1/manager/users/:id/access`
- `admin-system.controller.ts`
  - `GET /api/v1/manager/system/metrics`
- `users.service.ts`: query user, lock/unlock, update ho so.
- `services/user-factory.service.ts`: tao user.
- `services/password.service.ts`: hash/compare password.

### `chat`

Xu ly phong chat, tin nhan, SSE/realtime va trang quan ly tin nhan.

- `chat.controller.ts`
  - User:
    - `GET /api/v1/chat/stream`
    - `GET /api/v1/chat/conversations`
    - `GET /api/v1/chat/conversations/:id`
    - `POST /api/v1/chat/conversations/:id/messages`
    - `GET /api/v1/chat/conversations/:id/messages`
    - `PATCH /api/v1/chat/conversations/:id/read`
    - `PATCH /api/v1/chat/conversations/:id/typing`
    - `PATCH /api/v1/chat/conversations/:id/block`
    - `PATCH /api/v1/chat/conversations/:id/end`
    - `PATCH /api/v1/chat/conversations/:id/accept`
  - Manager:
    - `GET /api/v1/manager/chats`
    - `GET /api/v1/manager/chats/:id/messages`
- `chat.service.ts`: query, tao tin nhan, trang thai phong.
- `chat-realtime.service.ts`: realtime/SSE.

### `match`

Xu ly ghep doi nguoi dung.

- `match.controller.ts`
  - `POST /api/v1/match/join`
  - `DELETE /api/v1/match/leave`
  - `GET /api/v1/match/status`
- `match.service.ts`: hang doi va logic ghep doi.

### `report`

Xu ly bao cao nguoi dung va quan ly bao cao.

- `report.controller.ts`
  - User:
    - `POST /api/v1/reports`
    - `GET /api/v1/reports/reportable-users`
    - `GET /api/v1/reports/my-reports`
  - Manager:
    - `GET /api/v1/manager/reports/stats`
    - `GET /api/v1/manager/reports`
    - `GET /api/v1/manager/reports/:id`
    - `PATCH /api/v1/manager/reports/:id/status`
- `report.service.ts`: tao bao cao, doi trang thai, khoa/mo khoa lien quan bao cao.

### `conduct`

Xu ly luat ung xu va tu khoa can chan.

- `conduct.controller.ts`
  - `GET /api/v1/manager/conduct-rules`
  - `POST /api/v1/manager/conduct-rules`
  - `PATCH /api/v1/manager/conduct-rules/:id`
  - `DELETE /api/v1/manager/conduct-rules/:id`
- `conduct.service.ts`: CRUD va pagination.
- `entities/conduct-rule.entity.ts`: entity TypeORM, dung `declare` cho field ORM gan sau.

### `common`, `security`, `database`

- `common/interceptors`: logger, mask role, response helper.
- `security`: cau hinh bao ve request.
- `database/performance-index.service.ts`: dam bao index DB khi startup.

## Quy tac backend

- Khong dung `SELECT *` neu endpoint chi can vai field.
- Endpoint danh sach dung pagination/cursor, khong dung offset lon.
- Index nen uu tien composite index theo query thuc te:
  - `room_id, created_at DESC`
  - `user_id, created_at DESC`
  - `created_at, id`
- Middleware auth chi match route can bao ve.
- Logout chi clear cookie/token, khong query DB neu khong can.
- Refresh access token chi khi access token loi/het han.
- Response API khong tra `role` ra client.

## Frontend

Thu muc chinh: `Frontend`.

```text
Frontend
+-- app
+-- components
+-- contexts
+-- features
+-- hooks
+-- lib
+-- public
```

### App Router

- `app/layout.tsx`: metadata, title, favicon logo, Radix `Theme`, providers.
- `app/page.tsx`: layout user chinh va tab: chat, website, ca nhan, vip, settings, report.
- `app/admin/(dashboard)`: cac trang quan ly.
- `app/api/v1/...`: Next route handler proxy toi backend.

### API proxy frontend

- User proxy:
  - `app/api/v1/auth/*`
  - `app/api/v1/users/*`
  - `app/api/v1/chat/*`
  - `app/api/v1/match/*`
  - `app/api/v1/reports/*`
- Manager proxy:
  - `app/api/v1/manager/users`
  - `app/api/v1/manager/chats`
  - `app/api/v1/manager/reports`
  - `app/api/v1/manager/conduct-rules`
  - `app/api/v1/manager/system/metrics`

### `features/athu`

Login user va API dung chung.

- `page/LoginPage.tsx`: trang dang nhap Google.
- `components`: auth shell, panel, button, error, copy.
- `api/adminApi.ts`: API manager client, co cache/dedupe GET ngan han.
- `api/chatApi.ts`, `api/reportApi.ts`: API user.
- `hooks`: Google login/identity.
- `store`: UI state cho auth.

### `features/chat`

Trang chat nguoi dung.

- `page/ChatPage.tsx`: page chinh.
- `components`: moi component mot nhiem vu rieng:
  - `ChatArea`
  - `ChatHomeSidebar`
  - `ChatHomeMainPanel`
  - `ChatConversationSection`
  - `SearchPeople`
  - `MatchPeople`
  - `match/*`
- `hooks/useChatHome.ts`: xu ly load conversation, match, chat.
- `store`: Zustand state rieng cho chat home va match UI.

### `features/admin`

Giao dien quan ly.

```text
features/admin
+-- components
|   +-- chat
|   +-- conduct
|   +-- dashboard
|   +-- layout
|   +-- reports
|   +-- settings
|   +-- users
|   +-- vip
+-- hooks
+-- login
+-- page
+-- store
+-- styles
```

- `page`: moi route co mot page component rieng:
  - `DashboardPage`
  - `UsersPage`
  - `ChatsPage`
  - `ConductPage`
  - `ReportsPage`
  - `VipPackagesPage`
  - `SettingsPage`
- `components/layout`:
  - `AdminSidebar`: Server Component, active menu theo `x-current-path`, `prefetch={false}` de khong goi API thua.
  - `AdminNavbar`
  - `AdminCurrentUser`
  - `AdminLogoutButton`
- `hooks`: xu ly logic trang.
- `store`: Zustand cho users, reports, server metrics.

### `features/vip`

Trang VIP da chia lai theo cau truc nho.

```text
features/vip
+-- components
+-- hooks
+-- page
+-- store
+-- types.ts
+-- utils
```

- `page/VipPage.tsx`: chi rap layout.
- `components`: hero, status, card, price, feature item, button.
- `hooks`: `useVipBenefits`, `useVipPackages`.
- `store/vipStore.ts`: data goi VIP va quyen loi.
- `utils/sortVipPackages.ts`: sort rieng.

### `features/user-layout`

Component layout chung cho cac trang user.

- `UserPageShell`
- `UserHero`
- `UserPanel`
- `FeatureTile`
- `hooks/useUserTabs`
- `store/useUserLayoutStore`

## Quy tac giao dien

- Dung Radix UI Themes va Radix Icons.
- Component chi nen lam mot nhiem vu.
- Page chi rap layout, khong nhot logic phuc tap.
- Hook xu ly thao tac/fetch/state logic.
- Store giu state chia se bang Zustand.
- Data tinh co the de trong `store` hoac file data rieng.
- Sort/filter nen tach vao `utils` neu dung lai hoac lam code dai.
- Tranh long card trong card.
- Sidebar/menu dung `prefetch={false}` voi cac trang co server fetch de tranh goi API khi chua click.
- Neu component can `useState`, `useEffect`, zustand hook, event handler thi moi dung `"use client"`.
- Neu chi render UI, doc cookie/header, fetch server thi uu tien RSC.

## Kiem tra truoc khi ket thuc

Frontend:

```bash
cd Frontend
pnpm build
```

Backend:

```bash
cd backend
pnpm build
```

Neu VS Code bao loi cu nhung build pass:

- Restart TypeScript server.
- Reload window.
- Kiem tra file dang mo co phai ban cu/cache khong.
