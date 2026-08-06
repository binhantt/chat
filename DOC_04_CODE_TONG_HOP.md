# DOC 04 - Code, API, and File Change Notes

Updated: 30/05/2026

This document summarizes key code files, active APIs, and how to make further changes.

## Run Commands

Frontend:

```bash
cd D:\chat\Frontend
pnpm.cmd dev
pnpm.cmd build
```

Backend:

```bash
cd D:\chat\backend
pnpm.cmd start:dev
pnpm.cmd build
```

## User API

Auth:

- `POST /api/v1/auth/google-login`
- `POST /api/v1/auth/email-login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

User:

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `DELETE /api/v1/users/me`
- `POST /api/v1/users/setup-profile`
- `GET /api/v1/users/:id`

Chat:

- `GET /api/v1/chat/stream`
- `GET /api/v1/chat/conversations`
- `GET /api/v1/chat/conversations/:id`
- `GET /api/v1/chat/conversations/:id/messages`
- `POST /api/v1/chat/conversations/:id/messages`
- `PATCH /api/v1/chat/conversations/:id/typing`
- `PATCH /api/v1/chat/conversations/:id/end`
- `PATCH /api/v1/chat/conversations/:id/accept`

Match:

- `POST /api/v1/match/join`
- `DELETE /api/v1/match/leave`
- `GET /api/v1/match/status`

Reports:

- `POST /api/v1/reports`
- `GET /api/v1/reports/reportable-users`
- `GET /api/v1/reports/my-reports`

## Manager API

Manager API does not use `/admin` namespace; uses `/manager`.

Login:

- `POST /api/v1/manager/login`

Users:

- `GET /api/v1/manager/users?limit=20&cursor=...`
- `GET /api/v1/manager/users/:id`
- `POST /api/v1/manager/users`
- `PATCH /api/v1/manager/users/:id/access`

Chats:

- `GET /api/v1/manager/chats?limit=20&cursor=...`
- `GET /api/v1/manager/chats/:id/messages`

Conduct:

- `GET /api/v1/manager/conduct-rules?limit=10&cursor=...`
- `POST /api/v1/manager/conduct-rules`
- `PATCH /api/v1/manager/conduct-rules/:id`
- `DELETE /api/v1/manager/conduct-rules/:id`

Reports:

- `GET /api/v1/manager/reports?limit=20&cursor=...`
- `GET /api/v1/manager/reports/stats`
- `GET /api/v1/manager/reports/:id`
- `PATCH /api/v1/manager/reports/:id/status`

System:

- `GET /api/v1/manager/system/metrics`

## Key Frontend Routes

- `/login`: user login.
- `/`: main user app.
- `/admin/login`: manager login.
- `/admin`: manager dashboard.
- `/admin/users`: user management.
- `/admin/chats`: conversation management.
- `/admin/conduct`: conduct management.
- `/admin/reports`: report management.
- `/admin/vip`: VIP package management.
- `/admin/settings`: manager settings.

## Commonly Modified Backend Files

Auth:

- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/services/auth-cookie.service.ts`
- `backend/src/auth/services/auth-token.service.ts`
- `backend/src/auth/guards/demo-auth.guard.ts`

Users:

- `backend/src/users/user.controller.ts`
- `backend/src/users/users.service.ts`
- `backend/src/users/entities/user.entity.ts`
- `backend/src/users/dto/update-user-access.dto.ts`

Chat:

- `backend/src/chat/chat.controller.ts`
- `backend/src/chat/chat.service.ts`
- `backend/src/chat/chat-realtime.service.ts`
- `backend/src/chat/entities/conversation.entity.ts`
- `backend/src/chat/entities/message.entity.ts`

Match:

- `backend/src/match/match.controller.ts`
- `backend/src/match/match.service.ts`
- `backend/src/match/entities/match-queue.entity.ts`

Report:

- `backend/src/report/report.controller.ts`
- `backend/src/report/report.service.ts`
- `backend/src/report/entities/report.entity.ts`

Conduct:

- `backend/src/conduct/conduct.controller.ts`
- `backend/src/conduct/conduct.service.ts`
- `backend/src/conduct/entities/conduct-rule.entity.ts`

## Commonly Modified Frontend Files

Layout:

- `Frontend/app/layout.tsx`
- `Frontend/app/page.tsx`
- `Frontend/middleware.ts`
- `Frontend/components/providers/Providers.tsx`
- `Frontend/components/brand/BrandLogo.tsx`

Auth:

- `Frontend/contexts/AuthContext.tsx`
- `Frontend/contexts/ThemeContext.tsx`
- `Frontend/features/athu/page/LoginPage.tsx`
- `Frontend/features/athu/components/*`
- `Frontend/features/athu/api/*`

Admin Layout:

- `Frontend/features/admin/components/AdminLayout.tsx`
- `Frontend/features/admin/components/layout/AdminSidebar.tsx`
- `Frontend/features/admin/components/layout/AdminMobileNav.tsx`
- `Frontend/features/admin/components/layout/AdminNavbar.tsx`
- `Frontend/features/admin/components/layout/adminNavigation.tsx`

Admin Users:

- `Frontend/features/admin/page/UsersPage.tsx`
- `Frontend/features/admin/hooks/useAdminUsersPage.ts`
- `Frontend/features/admin/store/useAdminUsersStore.ts`
- `Frontend/features/admin/components/users/*`
- `Frontend/features/admin/styles/usersTheme.ts`

Admin Reports:

- `Frontend/features/admin/page/ReportsPage.tsx`
- `Frontend/features/admin/hooks/useAdminReportsPage.ts`
- `Frontend/features/admin/store/useAdminReportsStore.ts`
- `Frontend/features/admin/components/reports/*`
- `Frontend/features/admin/styles/reportsTheme.ts`

Admin Conduct:

- `Frontend/features/admin/page/ConductPage.tsx`
- `Frontend/features/admin/components/conduct/*`
- `Frontend/features/admin/styles/conductTheme.ts`

Admin Dashboard:

- `Frontend/features/admin/page/DashboardPage.tsx`
- `Frontend/features/admin/components/dashboard/*`
- `Frontend/features/admin/hooks/useAdminServerMetrics.ts`
- `Frontend/features/admin/store/useAdminServerMetricsStore.ts`

User Chat:

- `Frontend/features/chat/page/ChatPage.tsx`
- `Frontend/features/chat/hooks/useChatHome.ts`
- `Frontend/features/chat/store/*`
- `Frontend/features/chat/components/*`

Settings:

- `Frontend/features/settings/page/SettingsPage.tsx`
- `Frontend/features/settings/components/SettingsForm.tsx`
- `Frontend/features/settings/components/*`

VIP:

- `Frontend/features/vip/page/VipPage.tsx`
- `Frontend/features/vip/components/*`
- `Frontend/features/vip/hooks/*`
- `Frontend/features/vip/store/*`
- `Frontend/features/vip/utils/*`

## Code Patterns to Follow

### Page Component

Pages should only wrap components:

```tsx
import { UsersClientView } from "@/features/admin/components/users";

export function UsersPage() {
  return <UsersClientView />;
}
```

### Hook for Logic

```tsx
export function useAdminUsersPage() {
  // state, fetch, filter, pagination
  return {
    users,
    loading,
    refreshUsers,
  };
}
```

### Zustand Store

```tsx
import { create } from "zustand";

type State = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

export const useStore = create<State>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
```

### Backend Service List with Cursor

```ts
const rows = await repository
  .createQueryBuilder("item")
  .select("item.id", "id")
  .addSelect("item.createdAt", "createdAt")
  .where("item.createdAt < :createdAt", { createdAt })
  .orderBy("item.createdAt", "DESC")
  .addOrderBy("item.id", "DESC")
  .take(limit + 1)
  .getRawMany();
```

### Backend Batch Query Instead of N+1

```ts
const rows = await repository
  .createQueryBuilder("item")
  .where("item.userId IN (:...userIds)", { userIds })
  .getMany();
```

## Notes to Remember

- Admin UI route is still `/admin`.
- Manager API uses `/api/v1/manager`, not `/api/v1/admin`.
- Only refresh when access token fails/expires.
- Only logout when refresh token expires.
- When user is locked, clear cookie and exit immediately.
- Dark mode must affect both user and admin.
- Mobile admin uses bottom nav.
- Admin sidebar does not prefetch pages to avoid unnecessary API calls.
- Don't store user object in localStorage long-term if not needed.
- Before commit/push, check `git status` first as the repo has many changes.
