# Chat Project Structure

This document quickly describes the current backend and frontend structure to continue development without confusion.

## Overview

- `backend`: NestJS API, TypeORM, PostgreSQL, cookie auth.
- `Frontend`: Next.js App Router, React, Radix UI, Zustand.
- Public user API uses `/api/v1/...`.
- Management area no longer exposes `admin` in API; uses namespace `/api/v1/manager/...`.
- Frontend management route is still `/admin/...` for easy user access.
- **CQRS + Event-Driven** architecture is applied for the `conduct` module (see [DOC_08_EVENT_DRIVEN.md](DOC_08_EVENT_DRIVEN.md)).

## Event-Driven Architecture

The project applies Event-Driven Architecture combined with CQRS. Commands (Create, Update, Delete) are handled by separate handlers, and after completion **emit events** via `EventBusService` (using RxJS Subject). Listeners can listen and react.

```text
Command Handler -> DB + Cache -> EventBus.emit() -> Listeners
Query Handler  -> DB Read       -> Response
```

Currently Event-Driven is applied in the `conduct` module. See [DOC_08_EVENT_DRIVEN.md](DOC_08_EVENT_DRIVEN.md) for details and expansion guide.

## Backend

Main directory: `backend/src`.

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

Handles login, refresh token, logout, cookie, and Google auth.

- `auth.controller.ts`
  - `POST /api/v1/auth/google-login`
  - `POST /api/v1/auth/email-login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `POST /api/v1/manager/login`
- `auth.service.ts`: login business logic.
- `services/auth-cookie.service.ts`: set, clear, refresh cookie.
- `services/auth-token.service.ts`: create and verify access/refresh token.
- `services/google-auth.service.ts`: Google authentication.

### `users`

Handles user profiles, user management, and system resources.

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
- `users.service.ts`: query user, lock/unlock, update profile.
- `services/user-factory.service.ts`: create user.
- `services/password.service.ts`: hash/compare password.

### `chat`

Handles chat rooms, messages, SSE/realtime, and message management pages.

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
- `chat.service.ts`: query, create message, room status.
- `chat-realtime.service.ts`: realtime/SSE.

### `match`

Handles user matching.

- `match.controller.ts`
  - `POST /api/v1/match/join`
  - `DELETE /api/v1/match/leave`
  - `GET /api/v1/match/status`
- `match.service.ts`: queue and matching logic.

### `report`

Handles user reports and report management.

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
- `report.service.ts`: create report, change status, lock/unlock related to reports.

### `conduct`

Handles conduct rules and blocked keywords. Uses **CQRS + Event-Driven** architecture. Commands and queries are separated, each handler has a single responsibility.

**API:**
- `GET /api/v1/manager/conduct-rules`
- `POST /api/v1/manager/conduct-rules`
- `PATCH /api/v1/manager/conduct-rules/:id`
- `DELETE /api/v1/manager/conduct-rules/:id`

**Directory structure:**

```text
src/conduct/
├── commands/
│   ├── create-conduct-rule.command.ts      # Command definition
│   ├── update-conduct-rule.command.ts
│   ├── delete-conduct-rule.command.ts
│   └── handlers/
│       ├── create-conduct-rule.handler.ts  # Handler + emit event
│       ├── update-conduct-rule.handler.ts
│       └── delete-conduct-rule.handler.ts
├── queries/
│   ├── get-conduct-rules.query.ts          # Query definition
│   ├── check-message.query.ts
│   └── handlers/
│       ├── get-conduct-rules.handler.ts    # Handler reads data
│       └── check-message.handler.ts
├── events/
│   ├── event-bus.service.ts               # EventBus (RxJS Subject)
│   ├── conduct-rule-created.event.ts       # Event factory
│   ├── conduct-rule-updated.event.ts
│   └── conduct-rule-deleted.event.ts
├── entities/conduct-rule.entity.ts
├── pipes/
├── repositories/conduct-rule.repository.ts
└── services/
    ├── conduct-rule-cache.service.ts
    ├── conduct-rule-cursor.service.ts
    ├── conduct-rule-normalizer.service.ts
    └── conduct-rule-seeder.service.ts
```

**Processing flow:**
- Command (POST/PATCH/DELETE) -> Handler -> DB + Cache -> `EventBus.emit()` -> Response
- Query (GET) -> Handler -> DB Read -> Response
- Controller injects handlers directly, no service layer in between

### `common`, `security`, `database`

- `common/interceptors`: logger, mask role, response helper.
- `security`: request protection config.
- `database/performance-index.service.ts`: ensures DB indexes at startup.

## Backend Rules

- Don't use `SELECT *` if endpoint only needs a few fields.
- List endpoints use pagination/cursor, not large offsets.
- Indexes should prioritize composite indexes based on actual queries:
  - `room_id, created_at DESC`
  - `user_id, created_at DESC`
  - `created_at, id`
- Auth middleware only matches routes that need protection.
- Logout only clears cookie/token, avoid DB query if not needed.
- Only refresh access token when it fails/expires.
- API response does not return `role` to client.

## Frontend

Main directory: `Frontend`.

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
- `app/page.tsx`: main user layout and tabs: chat, website, personal, vip, settings, report.
- `app/admin/(dashboard)`: management pages.
- `app/api/v1/...`: Next route handler proxy to backend.

### Frontend API Proxy

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

User login and shared API.

- `page/LoginPage.tsx`: Google login page.
- `components`: auth shell, panel, button, error, copy.
- `api/adminApi.ts`: manager API client with GET cache/dedupe.
- `api/chatApi.ts`, `api/reportApi.ts`: user APIs.
- `hooks`: Google login/identity.
- `store`: auth UI state.

### `features/chat`

User chat page.

- `page/ChatPage.tsx`: main page.
- `components`: each component has a single responsibility:
  - `ChatArea`
  - `ChatHomeSidebar`
  - `ChatHomeMainPanel`
  - `ChatConversationSection`
  - `SearchPeople`
  - `MatchPeople`
  - `match/*`
- `hooks/useChatHome.ts`: handles loading conversations, match, chat.
- `store`: Zustand state for chat home and match UI.

### `features/admin`

Admin management interface.

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

- `page`: each route has its own page component:
  - `DashboardPage`
  - `UsersPage`
  - `ChatsPage`
  - `ConductPage`
  - `ReportsPage`
  - `VipPackagesPage`
  - `SettingsPage`
- `components/layout`:
  - `AdminSidebar`: Server Component, active menu from `x-current-path`, `prefetch={false}` to avoid unnecessary API calls.
  - `AdminNavbar`
  - `AdminCurrentUser`
  - `AdminLogoutButton`
- `hooks`: page logic.
- `store`: Zustand for users, reports, server metrics.

### `features/vip`

VIP page restructured into small components.

```text
features/vip
+-- components
+-- hooks
+-- page
+-- store
+-- types.ts
+-- utils
```

- `page/VipPage.tsx`: only wraps layout.
- `components`: hero, status, card, price, feature item, button.
- `hooks`: `useVipBenefits`, `useVipPackages`.
- `store/vipStore.ts`: VIP package data and benefits.
- `utils/sortVipPackages.ts`: custom sort.

### `features/user-layout`

Shared layout component for user pages.

- `UserPageShell`
- `UserHero`
- `UserPanel`
- `FeatureTile`
- `hooks/useUserTabs`
- `store/useUserLayoutStore`

## Frontend Rules

- Use Radix UI Themes and Radix Icons.
- Components should have a single responsibility.
- Pages only wrap layout, don't cram complex logic.
- Hooks handle operations/fetch/state logic.
- Stores hold shared state via Zustand.
- Static data can be in `store` or separate data files.
- Sort/filter should be in `utils` if reused or makes code long.
- Avoid card-in-card nesting.
- Sidebar/menu uses `prefetch={false}` for pages with server fetch to avoid API calls before click.
- Only use `"use client"` when component needs `useState`, `useEffect`, zustand hook, event handler.
- Prefer RSC for static UI rendering, cookie/header reading, server fetching.

## Pre-Completion Checks

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

If VS Code shows old errors but build passes:

- Restart TypeScript server.
- Reload window.
- Check if the open file is a stale/cached version.
