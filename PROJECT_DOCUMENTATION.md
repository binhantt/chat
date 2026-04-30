# Chat Project Documentation

Cap nhat: 2026-04-30

Tai lieu nay tong hop cau truc hien tai cua du an `D:\chat`, gom frontend Next.js va backend NestJS. Noi dung duoc viet theo code dang co trong workspace, khong dua tren README mac dinh cua framework.

## 1. Tong quan

Du an la he thong chat co khu vuc admin de dang nhap, xem dashboard, quan ly chat, user, role va cau hinh he thong.

- `frontend`: ung dung Next.js App Router, React 19, Radix UI Themes, Tailwind CSS 4.
- `backend`: API NestJS, TypeORM, PostgreSQL.
- Xac thuc hien tai gom email/password, admin login rieng, Google demo token va cookie session.
- Phan quyen backend dung guard dang nhap demo + ABAC policy.

## 2. Cau truc thu muc

```text
D:\chat
|-- backend
|   |-- src
|   |   |-- auth
|   |   |   |-- constants
|   |   |   |-- decorators
|   |   |   |-- dto
|   |   |   |-- guards
|   |   |   |-- interfaces
|   |   |   |-- policies
|   |   |   `-- services
|   |   |-- database
|   |   |-- users
|   |   |   |-- dto
|   |   |   |-- entities
|   |   |   |-- interfaces
|   |   |   `-- services
|   |   |-- app.controller.ts
|   |   |-- app.module.ts
|   |   |-- app.service.ts
|   |   `-- main.ts
|   |-- test
|   |-- package.json
|   `-- tsconfig.json
|-- frontend
|   |-- src
|   |   |-- app
|   |   |-- components
|   |   |-- features
|   |   |-- hooks
|   |   `-- lib
|   |-- package.json
|   |-- next.config.ts
|   `-- tsconfig.json
|-- PROJECT_STRUCTURE_GUIDE.md
|-- admin-login-copy-update.md
`-- PROJECT_DOCUMENTATION.md
```

## 3. Cach chay local

### Backend

```bash
cd backend
pnpm install
pnpm start:dev
```

Backend mac dinh lang nghe `process.env.PORT ?? 3000`. Neu chay frontend Next.js cung may, nen dat backend sang port khac, vi Next.js cung mac dinh dung `3000`.

Vi du:

```bash
PORT=3001 pnpm start:dev
```

Bien moi truong backend dang duoc code doc:

| Bien | Y nghia |
| --- | --- |
| `PORT` | Port backend NestJS |
| `DATABASE_URL` | Chuoi ket noi PostgreSQL uu tien neu co |
| `DB_HOST` | Host PostgreSQL khi khong co `DATABASE_URL` |
| `DB_PORT` | Port PostgreSQL, mac dinh `5432` |
| `DB_USERNAME` | Username PostgreSQL, mac dinh `postgres` |
| `DB_PASSWORD` | Password PostgreSQL, mac dinh `postgres` |
| `DB_DATABASE` | Database, mac dinh `chat` |
| `DB_SYNC` | Bat TypeORM synchronize khi bang `true` |
| `DB_SSL` | Bat SSL khi bang `true` |
| `ADMIN_EMAIL` | Email admin seed mac dinh, fallback `admin@example.com` |
| `ADMIN_PASSWORD` | Mat khau admin seed mac dinh, fallback `Admin@123456` |

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend doc backend tu:

```env
BACKEND_URL=http://localhost:3001
```

`frontend/.env.example` hien dang dat `BACKEND_URL=http://localhost:3000`. Neu backend va frontend chay dong thoi, can sua lai cho dung port backend thuc te.

## 4. Frontend

### Stack

- Next.js `16.2.4`
- React `19.2.4`
- `@radix-ui/themes` va `@radix-ui/react-icons`
- Tailwind CSS 4 qua `@tailwindcss/postcss`
- TypeScript strict, alias `@/*` tro toi `frontend/src/*`

### Route chinh

| Route | File | Vai tro |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Redirect sang `/login` |
| `/login` | `src/app/login/page.tsx` | Trang login user bang Google UI |
| `/admin/login` | `src/app/admin/login/page.tsx` | Trang login admin, redirect sang `/admin` neu da co cookie |
| `/admin` | `src/app/admin/page.tsx` | Dashboard admin |
| `/admin/chat` | `src/app/admin/chat/page.tsx` | Quan ly chat, du lieu mock |
| `/admin/users` | `src/app/admin/users/page.tsx` | Danh sach user tu backend |
| `/admin/users/[id]` | `src/app/admin/users/[id]/page.tsx` | Chi tiet user va cap nhat quyen |
| `/admin/roles` | `src/app/admin/roles/page.tsx` | Man hinh role, du lieu mock |
| `/admin/settings` | `src/app/admin/settings/page.tsx` | Form cau hinh UI tinh |
| `/api/admin/v1/login` | `src/app/api/admin/v1/login/route.ts` | Proxy admin login toi backend |
| `/api/admin/users/[id]/access` | `src/app/api/admin/users/[id]/access/route.ts` | Proxy cap nhat role/isActive toi backend |

### Layout va UI

- `src/app/layout.tsx`: khai bao metadata, Radix `Theme`, font Manrope va IBM Plex Mono.
- `src/app/globals.css`: import Radix Theme + Tailwind, dinh nghia mau nen, font va style global.
- `src/app/admin/layout.tsx`: layout rieng admin, bo qua sidebar/navbar khi path la `/admin/login`.
- `src/features/layout/admin/components/AdminSidebar.tsx`: menu admin gom tong quan, chat, users, roles, settings va form logout.
- `src/features/layout/admin/components/AdminNavbar.tsx`: topbar admin voi button menu mobile, bell, dropdown profile.

### Auth frontend

Thu muc chinh:

```text
frontend/src/features/auth
|-- api/auth-client.ts
|-- components/AuthPage.tsx
|-- components/GoogleLoginForm.tsx
|-- components/LoginForm.tsx
|-- hooks/useAuthSession.ts
|-- types/index.ts
`-- index.ts
```

Luong admin login:

1. User vao `/admin/login`.
2. `AdminLoginPage` doc cookie `refresh_token` va `user_id`.
3. Neu co session thi redirect `/admin`; neu chua co thi render `AuthPage`.
4. `AuthPage` render `LoginForm`.
5. `LoginForm` dung `useAuthSession`.
6. `useAuthSession` validate email/password, goi `emailLogin`.
7. `emailLogin` POST `/api/admin/v1/login`.
8. Next route handler proxy sang backend `POST /api/admin/v1/login`.
9. Backend set cookie, frontend redirect `/admin`.

`useAuthSession` co:

- Validate email format va password rong.
- Remember email qua `localStorage` key `chat.admin.remembered-email`.
- Toggle hien/an password.
- Chuan hoa thong bao loi theo status va noi dung backend tra ve.

`GoogleLoginForm` hien moi la UI button, chua goi API Google login.

### Data va helper frontend

- `src/lib/backend-url.ts`: doc `BACKEND_URL`, `NEXT_PUBLIC_BACKEND_URL`, fallback dev `http://localhost:3000`, va xoa dau `/` cuoi.
- `src/lib/admin-users.ts`: server helper goi backend `/admin/users`, `/admin/users/:id`, map `AdminUser` thanh `AdminUserRecord`.
- `src/hooks/useUserManagement.ts`: filter danh sach user theo query.
- `src/hooks/useDashboardData.ts`: mock metric, activity, health va chart data cho dashboard.
- `src/components/admin/chat/mockChats.ts`: mock chat table.
- `src/components/admin/roles/mockRoles.ts`: mock role grid.

## 5. Backend

### Stack

- NestJS `11`
- TypeORM `0.3`
- PostgreSQL qua package `pg`
- TypeScript `ES2023`, module `nodenext`
- Jest/Supertest cho test

### Bootstrap va module

- `src/main.ts`: tao Nest app, bat CORS `origin: true`, `credentials: true`, lang nghe `PORT` hoac `3000`.
- `src/app.module.ts`: import TypeORM config, `UsersModule`, `AuthModule`.
- `src/database/postgres.config.ts`: tao cau hinh PostgreSQL tu `DATABASE_URL` hoac cac bien `DB_*`.
- `src/app.controller.ts`: `GET /`.
- `src/app.service.ts`: tra ve `Backend is running`.

### Entity user

`src/users/entities/user.entity.ts` dinh nghia bang `users`:

| Field | Ghi chu |
| --- | --- |
| `id` | UUID primary key |
| `email` | Unique |
| `googleId` | Nullable, unique |
| `passwordHash` | Nullable, `select: false` |
| `fullName` | Nullable |
| `avatarUrl` | Nullable |
| `dateOfBirth` | Nullable |
| `phoneNumber` | Nullable |
| `bio` | Nullable |
| `role` | Enum `admin` hoac `user` |
| `isActive` | Trang thai tai khoan |
| `createdAt` | Auto create timestamp |
| `updatedAt` | Auto update timestamp |

### Users module

Thu muc:

```text
backend/src/users
|-- dto
|-- entities
|-- interfaces
|-- services/password.service.ts
|-- services/user-factory.service.ts
|-- user.controller.ts
|-- users.module.ts
`-- users.service.ts
```

`UsersService` phu trach:

- `onModuleInit`: dam bao co bang users va seed default admin.
- `findAll`, `findById`, `findByIdOrFail`.
- `findByEmail`, `findByGoogleId`.
- `upsertFromGoogle`.
- `createByAdmin`.
- `validatePassword`.
- `update`.
- `updateAccess`.

Luu y quan trong:

- `seedDefaultAdmin` se tao hoac cap nhat admin moi lan module init, dung `ADMIN_EMAIL` va `ADMIN_PASSWORD`.
- `updateAccess` chan admin tu ha quyen hoac tu khoa chinh minh.
- `toSafeUser` dat `passwordHash` ve `null` truoc khi tra ve.
- `ensureUsersTable` goi `dataSource.synchronize(false)` neu chua co bang `users`.

`PasswordService` dung `scryptSync`, salt bang `randomUUID`, va `timingSafeEqual` de verify.

### Auth module

Thu muc:

```text
backend/src/auth
|-- auth.controller.ts
|-- auth.module.ts
|-- auth.service.ts
|-- constants/auth-token.constant.ts
|-- decorators/check-policies.decorator.ts
|-- dto
|-- guards
|-- interfaces
|-- policies/abac.policy.ts
`-- services
```

`AuthService` co:

- `googleLogin(idToken)`: parse Google demo token, upsert user, tao token, tra user.
- `emailLogin(email, password)`: verify password va `isActive`.
- `adminEmailLogin(email, password)`: goi email login va bat buoc `role === admin`.
- `refreshAccessToken(refreshToken)`: verify refresh token va tao access token moi.

`AuthTokenService` hien tao token noi bo dang chuoi:

- Access token: `user:<userId>:<expiresAt>`
- Refresh token: `refresh:<uuid>`
- Refresh session luu trong memory `Map`, nen se mat khi restart backend.
- Access token TTL: 10 phut.
- Refresh token TTL: 130 ngay.

`AuthCookieService` set:

| Cookie | HttpOnly | Max age | Ghi chu |
| --- | --- | --- | --- |
| `access_token` | Co | Access TTL | Dung cho request da dang nhap |
| `refresh_token` | Co | Refresh TTL | Dung refresh/resolve session |
| `user_id` | Khong | Refresh TTL | Dung frontend check session nhanh |

`DemoAuthGuard` resolve user tu bearer token, cookie `access_token`, cookie `refresh_token`, cookie `user_id`, hoac header `x-user-id`.

`AbacGuard` doc policy tu `@CheckPolicies`, build context theo HTTP method va `params.id`.

### ABAC policy

`src/auth/policies/abac.policy.ts` dinh nghia:

- `canCreateUser`: chi admin.
- `canReadUser`: admin hoac owner.
- `canListUsers`: chi admin.
- `canUpdateUser`: admin hoac owner.
- `canDeleteUser`: chi admin.

### Backend API

| Method | Path | Guard | Vai tro |
| --- | --- | --- | --- |
| GET | `/` | Khong | Health text `Backend is running` |
| POST | `/auth/google-login` | Khong | Google demo login |
| POST | `/auth/email-login` | Khong | Login email/password chung |
| POST | `/auth/refresh` | Khong | Tao access token moi tu refresh cookie |
| POST | `/api/admin/v1/login` | Khong | Login admin, bat buoc role admin |
| GET | `/users/:id` | `DemoAuthGuard`, `AbacGuard` | Lay user theo id |
| PATCH | `/users/:id` | `DemoAuthGuard`, `AbacGuard` | Cap nhat user |
| GET | `/admin/users` | `DemoAuthGuard`, `AbacGuard` | Danh sach user, admin only |
| GET | `/admin/users/:id` | `DemoAuthGuard`, `AbacGuard` | Chi tiet user |
| POST | `/admin/users` | `DemoAuthGuard`, `AbacGuard` | Tao user boi admin |
| PATCH | `/admin/users/:id/access` | `DemoAuthGuard`, `AbacGuard` | Cap nhat role va isActive |

## 6. Luong quan trong

### Admin login end-to-end

```text
/admin/login
  -> AuthPage
  -> LoginForm
  -> useAuthSession.handleSubmit
  -> frontend POST /api/admin/v1/login
  -> backend POST /api/admin/v1/login
  -> AuthService.adminEmailLogin
  -> UsersService.validatePassword
  -> check role admin + isActive
  -> set access_token, refresh_token, user_id
  -> router.replace("/admin")
```

### Lay danh sach user admin

```text
/admin/users
  -> check cookie user_id + refresh_token
  -> fetchAdminUsers()
  -> backend GET /admin/users voi cookie auth
  -> DemoAuthGuard resolve user
  -> AbacGuard canListUsers
  -> UsersService.findAll()
  -> map AdminUserRecord cho UI
```

### Cap nhat quyen user

```text
/admin/users/[id]
  -> UserAccessDialog
  -> frontend PATCH /api/admin/users/[id]/access
  -> backend PATCH /admin/users/:id/access
  -> DemoAuthGuard + AbacGuard canUpdateUser
  -> UsersService.updateAccess()
  -> chan admin tu ha quyen/tu khoa chinh minh
  -> router.refresh()
```

## 7. Cac phan dang la mock hoac UI tinh

- Dashboard metric, chart, activity, health lay tu `useDashboardData`, chua goi backend.
- Quan ly chat dung `mockChats`, chua co API chat hien tai.
- Quan ly role dung `mockRoles`, chua co API role hien tai.
- Settings form la UI tinh, chua submit backend.
- User login Google page co `GoogleLoginForm`, nhung button chua goi `/auth/google-login`.
- Backend Google auth moi ho tro demo token dang `demo:<googleId>:<email>:<fullName>`, chua verify Google that.

## 8. Luu y ky thuat

- Backend va frontend deu co the chiem port `3000`; nen cau hinh `PORT=3001` cho backend khi chay chung.
- `AuthTokenService` hien la token demo, refresh session nam trong memory; chua phu hop production neu can multi-instance hoac restart khong mat session.
- Mot so text tieng Viet trong backend/settings dang bi loi encoding mojibake; nen chuan hoa UTF-8 neu muon hien thi co dau.
- `backend/test/app.e2e-spec.ts` dang expect `Hello World!`, trong khi `AppService` tra `Backend is running`; test e2e can cap nhat neu chay.
- `frontend/src/lib/backend-url.ts` co fallback dev `http://localhost:3000`; fallback nay de gay nham lan khi frontend cung chay tren `3000`.
- `logoutAction` xoa `user_id` va `refresh_token`, chua xoa `access_token`.

## 9. Checklist phat trien tiep

- Them env example cho backend neu can onboarding nhanh hon.
- Dong bo port local: backend `3001`, frontend `3000`, frontend `BACKEND_URL=http://localhost:3001`.
- Cap nhat test e2e backend theo response moi.
- Neu lam production auth, thay token chuoi demo bang JWT hoac session store ben vung.
- Them API cho chat, role va settings neu cac man hinh admin can data that.
- Chuan hoa encoding UTF-8 cho cac file co tieng Viet bi loi dau.
