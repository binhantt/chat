# DOC 01 - Project Structure

Updated: 30/05/2026

This document provides a quick overview of the entire Chat/Stranger project structure. The two main code directories are `backend` and `Frontend`; doc files are placed outside these two directories for easy discovery.

## Directory Overview

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

Backend uses NestJS, TypeORM, and PostgreSQL. Main API has prefix `/api`.

### `backend/src/auth`

Handles login, token, cookie, refresh token, and Google login.

- `auth.controller.ts`: defines login, refresh, logout, manager login routes.
- `auth.service.ts`: login business logic.
- `services/auth-token.service.ts`: create and verify access/refresh token.
- `services/auth-cookie.service.ts`: set/clear cookie and refresh access token.
- `guards/demo-auth.guard.ts`: guard reads cookie/token and assigns `request.user`.

### `backend/src/users`

Handles user, profile, lock/unlock account, manager users.

- `user.controller.ts`: user and manager users API.
- `admin-system.controller.ts`: server CPU/RAM resource API.
- `users.service.ts`: query user, update profile, lock/unlock, pagination.
- `entities/user.entity.ts`: `users` table and related indexes.
- `dto/*`: validate request payload.

### `backend/src/chat`

Handles conversation, message, SSE realtime.

- `chat.controller.ts`: user chat and manager chats API.
- `chat.service.ts`: create message, get conversations, end room.
- `chat-realtime.service.ts`: SSE events `message.created`, `conversation.created`, `typing`, `conversation.ended`.
- `entities/conversation.entity.ts`: `conversations` table.
- `entities/message.entity.ts`: `messages` table.

### `backend/src/match`

Handles user matching.

- `match.controller.ts`: join, leave, status.
- `match.service.ts`: queue, find match, create conversation.
- `entities/match-queue.entity.ts`: match queue table.

### `backend/src/report`

Handles violation reports.

- `report.controller.ts`: user report and manager reports API.
- `report.service.ts`: create report, list reports, update status, lock/unlock from report.
- `entities/report.entity.ts`: `reports` table and indexes.

### `backend/src/conduct`

Handles conduct rules / prohibited content.

- `conduct.controller.ts`: CRUD conduct rules.
- `conduct.service.ts`: list by cursor, add/edit/delete rule, check message.
- `entities/conduct-rule.entity.ts`: rule table.

### `backend/src/database`

- `performance-index.service.ts`: create performance indexes at startup.
- `postgres.config.ts`: DB connection config.

### `backend/src/security`

Protects requests, sanitizes input, configures cookie/CSRF/middleware.

## Frontend

Frontend uses Next.js App Router, React, Radix UI Themes, Zustand.

### `Frontend/app`

- `layout.tsx`: metadata, Radix Theme, Providers.
- `page.tsx`: main user page.
- `login/page.tsx`: user login page.
- `admin/(dashboard)/*`: admin dashboard routes.
- `admin/login/page.tsx`: manager login.
- `api/v1/*`: Next Route Handler proxy to backend.

### `Frontend/components`

Shared components.

- `brand/BrandLogo.tsx`: Stranger logo.
- `providers/Providers.tsx`: wraps ThemeProvider and AuthProvider.
- `layouts/users/*`: old/shared user layout.

### `Frontend/contexts`

- `AuthContext.tsx`: current user, logout, update user, cache `/users/me`.
- `ThemeContext.tsx`: light/dark mode for user and admin.

### `Frontend/features/athu`

User login and shared API client.

- `page/LoginPage.tsx`: Google login UI.
- `components/*`: Auth shell/panel/button/error.
- `api/adminApi.ts`: manager API client with GET cache/dedupe.
- `api/chatApi.ts`: user chat API.
- `api/reportApi.ts`: user report API.
- `hooks/*`: Google identity/login.
- `store/*`: Zustand auth UI state.
- `styles/authTheme.ts`: shared color tokens.

### `Frontend/features/chat`

User chat page.

- `page/ChatPage.tsx`: chat page wrapper.
- `components/ChatArea.tsx`: chat frame.
- `components/MatchPeople.tsx`: match people.
- `components/SearchPeople.tsx`: search people.
- `components/match/*`: match states.
- `hooks/useChatHome.ts`: load chat/match.
- `store/*`: Zustand chat state.

### `Frontend/features/admin`

Admin management pages.

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
- `page/*`: admin page routes.
- `hooks/*`: fetch/filter/pagination logic.
- `store/*`: Zustand manager state.
- `styles/*`: style tokens per group.

### `Frontend/features/settings`

User settings page: account info, preferences, dark mode, danger zone.

### `Frontend/features/report`

User report submission and report history page.

### `Frontend/features/vip`

VIP page split into small components: hero, benefits, package card, buy button, hook, store, sort utils.

### `Frontend/features/user-layout`

Shared shell for user pages, tabs, hero, panel, and layout.

## File Conventions

- Pages should only wrap layout.
- Fetch/state logic belongs in hooks or stores.
- Components should have a single responsibility.
- API clients are in `features/athu/api`.
- Next proxy routes are in `Frontend/app/api/v1`.
- Backend is split by NestJS module: controller, service, dto, entity.
