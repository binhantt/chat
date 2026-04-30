# Chat Project Structure Guide

Tai lieu nay ghi lai quy uoc lam viec cho du an `chat`, gom backend NestJS va frontend Next.js.

## Thu muc goc

```text
D:\chat
├── backend
└── frontend
```

## Backend

Backend dat trong `D:\chat\backend`.

Quy uoc chinh:

- `src/main.ts`: bootstrap app, khai bao controller cap ung dung va route HTTP.
- `src/auth`: chua nghiep vu xac thuc, DTO, guard, policy, token, cookie.
- `src/users`: chua entity, service, DTO va factory lien quan user.
- API admin login chuan: `POST /api/admin/v1/login`.
- Body admin login:

```json
{
  "email": "admin@example.com",
  "password": "Admin@123456"
}
```

- Response thanh cong tra ve `user`, `accessToken`, `refreshToken`, dong thoi set cookie xac thuc.
- Endpoint admin login phai kiem tra role `admin`; tai khoan role `user` khong duoc vao trang quan tri.

## Frontend

Frontend dat trong `D:\chat\frontend`.

Quy uoc chinh:

- `app`: Next.js App Router, route page va route handler.
- `app/api/admin/v1/login/route.ts`: proxy frontend cho API admin login.
- `src/features`: chua tung chuc nang doc lap.
- `src/features/auth`: chuc nang xac thuc.
- `src/features/auth/components`: component rieng cua auth, vi du `AuthPage`, `LoginForm`.
- `src/features/auth/api`: client goi API cua auth.
- `src/features/auth/hooks`: hook quan ly state/session cua auth.
- `src/features/auth/types`: type rieng cua auth.
- `src/components`: component dung chung toan ung dung.
- `src/components/ui`: wrapper UI dung lai, uu tien Radix UI.
- `src/lib`: helper chung, vi du `cn`, proxy backend.

## Nguyen tac UI

- Dung `@radix-ui/themes` cho form, card, badge, button, text field, separator va feedback state.
- Dung TailwindCSS cho layout ngan gon nhu spacing, grid, width, min-height.
- Khong dung CSS phuc tap, radius qua lon, shadow qua dai hoac decorative background lam kho bao tri.
- Component dung rieng cho mot chuc nang dat trong `src/features/<feature>/components`.
- Component dung chung dat trong `src/components`.
- Form dang nhap admin chi gom email, password, error state, loading state va submit.

## Luong dang nhap admin

1. User vao `app/admin/login/page.tsx`.
2. Page render `AuthPage` tu `src/features/auth`.
3. `LoginForm` goi hook `useAuthSession`.
4. Hook goi `emailLogin` trong `src/features/auth/api/auth-client.ts`.
5. Frontend POST `/api/admin/v1/login`.
6. Next route handler proxy sang backend `POST /api/admin/v1/login`.
7. Backend xac thuc email/password, kiem tra role admin, set cookie va tra user ve frontend.

## Checklist khi tao chuc nang moi

- Tao folder trong `src/features/<feature-name>`.
- Tach `api`, `components`, `hooks`, `types` neu chuc nang co du phan tu tuong ung.
- Chi export public API cua feature qua `src/features/<feature-name>/index.ts`.
- Dung component chung tu `src/components/ui` khi co the.
- Neu can API moi, dat route backend co version ro rang, vi du `/api/admin/v1/...`.
