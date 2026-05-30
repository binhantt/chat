# DOC 04 - Code, API va ghi chu sua file

Cap nhat: 30/05/2026

Tai lieu nay tong hop nhanh cac file code quan trong, API dang dung va cach sua tiep.

## Lenh chay

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

## API user

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

## API manager

Manager API khong dung namespace `/admin`; dung `/manager`.

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

## Frontend route quan trong

- `/login`: login user.
- `/`: app user chinh.
- `/admin/login`: login manager.
- `/admin`: dashboard manager.
- `/admin/users`: quan ly nguoi dung.
- `/admin/chats`: quan ly hoi thoai.
- `/admin/conduct`: quan ly ung xu.
- `/admin/reports`: quan ly bao cao.
- `/admin/vip`: quan ly goi VIP.
- `/admin/settings`: cai dat manager.

## File backend hay sua

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

## File frontend hay sua

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

Admin layout:

- `Frontend/features/admin/components/AdminLayout.tsx`
- `Frontend/features/admin/components/layout/AdminSidebar.tsx`
- `Frontend/features/admin/components/layout/AdminMobileNav.tsx`
- `Frontend/features/admin/components/layout/AdminNavbar.tsx`
- `Frontend/features/admin/components/layout/adminNavigation.tsx`

Admin users:

- `Frontend/features/admin/page/UsersPage.tsx`
- `Frontend/features/admin/hooks/useAdminUsersPage.ts`
- `Frontend/features/admin/store/useAdminUsersStore.ts`
- `Frontend/features/admin/components/users/*`
- `Frontend/features/admin/styles/usersTheme.ts`

Admin reports:

- `Frontend/features/admin/page/ReportsPage.tsx`
- `Frontend/features/admin/hooks/useAdminReportsPage.ts`
- `Frontend/features/admin/store/useAdminReportsStore.ts`
- `Frontend/features/admin/components/reports/*`
- `Frontend/features/admin/styles/reportsTheme.ts`

Admin conduct:

- `Frontend/features/admin/page/ConductPage.tsx`
- `Frontend/features/admin/components/conduct/*`
- `Frontend/features/admin/styles/conductTheme.ts`

Admin dashboard:

- `Frontend/features/admin/page/DashboardPage.tsx`
- `Frontend/features/admin/components/dashboard/*`
- `Frontend/features/admin/hooks/useAdminServerMetrics.ts`
- `Frontend/features/admin/store/useAdminServerMetricsStore.ts`

Chat user:

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

## Mau code nen theo

### Page component

Page chi nen rap component:

```tsx
import { UsersClientView } from "@/features/admin/components/users";

export function UsersPage() {
  return <UsersClientView />;
}
```

### Hook xu ly logic

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

### Store Zustand

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

### Backend service list cursor

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

### Backend batch query thay N+1

```ts
const rows = await repository
  .createQueryBuilder("item")
  .where("item.userId IN (:...userIds)", { userIds })
  .getMany();
```

## Ghi chu can nho

- UI admin route van la `/admin`.
- API manager dung `/api/v1/manager`, khong dung `/api/v1/admin`.
- Khi token access loi/het han moi refresh.
- Khi refresh token het han moi logout.
- Khi user bi khoa, clear cookie va thoat ngay.
- Dark mode phai anh huong ca user va admin.
- Mobile admin dung bottom nav.
- Sidebar admin khong prefetch trang de tranh goi API thua.
- Khong luu user object lau dai trong localStorage neu khong can.
- Neu commit/push, can xem `git status` truoc vi repo dang co nhieu thay doi.

