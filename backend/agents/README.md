# AGENTS - Onboarding Hub

Muc tieu: bat ky agent/dev nao vao du an `banked` co the doc 5-10 phut la hieu toan bo he thong va bat dau lam viec.

## 1) Bat dau nhanh
- Cai package:
  - `npm install`
- Setup database + migration:
  - `npm run db:setup`
- Chay backend:
  - `npm run dev`
- Chay unit test:
  - `npm run test:unit`

## 2) Doc theo thu tu
1. `agents/PROJECT_MAP.md`
2. `agents/API_CONNECT_GUIDE.md`

## 3) Luu y nhanh quan trong
- Day la backend API TypeScript + Express + Knex + MySQL2.
- Auth dang su dung JWT Access Token + Refresh Token.
- Protected chat routes chap nhan:
  - `Authorization: Bearer <access_token>`, hoac
  - cookie `access_token` + `refresh_token` (co kiem tra toan ven cap token).
- Google login hien co che do demo token:
  - `demo:<googleId>:<email>:<name>`
  - luong verify token Google that chua duoc trien khai xong.
