# DOC 01 - Cau truc du an

Cap nhat: 30/05/2026

Tai lieu nay dung de nhin nhanh toan bo cau truc du an Chat/Nguoi La. Hai thu muc code chinh la `backend` va `Frontend`; cac file doc dat ngoai hai thu muc nay de de tim.

## Tong quan thu muc

```text
D:\chat
|-- backend
|   |-- src
|   |   |-- auth
|   |   |-- chat
|   |   |-- common
|   |   |-- conduct
|   |   |-- database
|   |   |-- match
|   |   |-- report
|   |   |-- security
|   |   |-- users
|   |   |-- app.module.ts
|   |   |-- main.ts
|   |-- test
|   |-- package.json
|   |-- pnpm-lock.yaml
|
|-- Frontend
|   |-- app
|   |-- components
|   |-- contexts
|   |-- features
|   |-- hooks
|   |-- lib
|   |-- public
|   |-- package.json
|
|-- ARCHITECTURE.md
|-- DOC_01_CAU_TRUC.md
|-- DOC_02_Y_TUONG.md
|-- DOC_03_TOI_UU.md
|-- DOC_04_CODE_TONG_HOP.md
|-- DOC_05_BANG_MAU.md
|-- DOC_06_BAO_MAT.md
```

## Backend

Backend dung NestJS, TypeORM va PostgreSQL. API chinh co prefix `/api`.

### `backend/src/auth`

Phu trach dang nhap, token, cookie, refresh token va Google login.

- `auth.controller.ts`: dinh nghia route dang nhap, refresh, logout, manager login.
- `auth.service.ts`: xu ly nghiep vu dang nhap.
- `services/auth-token.service.ts`: tao va verify access/refresh token.
- `services/auth-cookie.service.ts`: set/clear cookie va refresh access token.
- `guards/demo-auth.guard.ts`: guard doc cookie/token va gan `request.user`.

### `backend/src/users`

Phu trach user, ho so, khoa/mo khoa tai khoan, manager users.

- `user.controller.ts`: API user va manager users.
- `admin-system.controller.ts`: API tai nguyen server CPU/RAM.
- `users.service.ts`: query user, update ho so, lock/unlock, pagination.
- `entities/user.entity.ts`: bang `users` va index lien quan.
- `dto/*`: validate payload request.

### `backend/src/chat`

Phu trach conversation, message, SSE realtime.

- `chat.controller.ts`: API chat user va manager chats.
- `chat.service.ts`: tao tin nhan, lay hoi thoai, ket thuc phong.
- `chat-realtime.service.ts`: SSE event `message.created`, `conversation.created`, `typing`, `conversation.ended`.
- `entities/conversation.entity.ts`: bang `conversations`.
- `entities/message.entity.ts`: bang `messages`.

### `backend/src/match`

Phu trach ghep doi nguoi dung.

- `match.controller.ts`: join, leave, status.
- `match.service.ts`: queue, tim match, tao conversation.
- `entities/match-queue.entity.ts`: bang queue ghep doi.

### `backend/src/report`

Phu trach bao cao vi pham.

- `report.controller.ts`: API report user va manager reports.
- `report.service.ts`: tao report, list report, cap nhat status, khoa/mo khoa tu report.
- `entities/report.entity.ts`: bang `reports` va index.

### `backend/src/conduct`

Phu trach luat ung xu/noi dung vi pham.

- `conduct.controller.ts`: CRUD conduct rules.
- `conduct.service.ts`: list theo cursor, them/sua/xoa rule, check message.
- `entities/conduct-rule.entity.ts`: bang rule.

### `backend/src/database`

- `performance-index.service.ts`: tao index hieu nang luc startup.
- `postgres.config.ts`: cau hinh ket noi DB.

### `backend/src/security`

Bao ve request, sanitize input, cau hinh cookie/CSRF/middleware.

## Frontend

Frontend dung Next.js App Router, React, Radix UI Themes, Zustand.

### `Frontend/app`

- `layout.tsx`: metadata, Radix Theme, Providers.
- `page.tsx`: trang user chinh.
- `login/page.tsx`: trang login user.
- `admin/(dashboard)/*`: route admin dashboard.
- `admin/login/page.tsx`: login manager.
- `api/v1/*`: Next Route Handler proxy toi backend.

### `Frontend/components`

Component dung chung.

- `brand/BrandLogo.tsx`: logo Nguoi La.
- `providers/Providers.tsx`: boc ThemeProvider va AuthProvider.
- `layouts/users/*`: layout user cu/dung chung.

### `Frontend/contexts`

- `AuthContext.tsx`: user hien tai, logout, update user, cache `/users/me`.
- `ThemeContext.tsx`: light/dark mode cho user va admin.

### `Frontend/features/athu`

Login user va API client dung chung.

- `page/LoginPage.tsx`: UI login Google.
- `components/*`: Auth shell/panel/button/error.
- `api/adminApi.ts`: API manager namespace `/api/v1/manager`.
- `api/chatApi.ts`: API chat user.
- `api/reportApi.ts`: API report user.
- `hooks/*`: Google identity/login.
- `store/*`: Zustand UI auth.
- `styles/authTheme.ts`: token mau dung chung.

### `Frontend/features/chat`

Trang chat user.

- `page/ChatPage.tsx`: rap trang chat.
- `components/ChatArea.tsx`: khung chat.
- `components/MatchPeople.tsx`: ghep nguoi.
- `components/SearchPeople.tsx`: tim kiem nguoi.
- `components/match/*`: cac trang thai ghep doi.
- `hooks/useChatHome.ts`: load chat/match.
- `store/*`: Zustand state chat.

### `Frontend/features/admin`

Trang quan ly.

```text
features/admin
|-- components
|   |-- chat
|   |-- conduct
|   |-- dashboard
|   |-- layout
|   |-- reports
|   |-- settings
|   |-- users
|   |-- vip
|-- hooks
|-- login
|-- page
|-- store
|-- styles
```

- `components/layout`: navbar, sidebar, mobile nav, current user, logout.
- `page/*`: page route admin.
- `hooks/*`: logic fetch/filter/page.
- `store/*`: Zustand state manager.
- `styles/*`: style tokens rieng tung nhom.

### `Frontend/features/settings`

Trang cai dat user: thong tin tai khoan, tuy chon, dark mode, danger zone.

### `Frontend/features/report`

Trang gui bao cao va lich su bao cao cua user.

### `Frontend/features/vip`

Trang VIP chia component nho: hero, benefits, package card, buy button, hook, store, utils sort.

### `Frontend/features/user-layout`

Shell chung cho trang user, tab, hero, panel va layout.

## Quy uoc dat file

- Page chi nen rap layout.
- Logic fetch/state nam trong hook hoac store.
- Component mot nhiem vu rieng.
- API client nam trong `features/athu/api`.
- Route proxy Next nam trong `Frontend/app/api/v1`.
- Backend chia theo module NestJS: controller, service, dto, entity.
