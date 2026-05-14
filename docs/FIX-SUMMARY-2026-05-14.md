# Tong hop cac phan da fix ngay 14/05/2026

Tai lieu nay tong hop cac thay doi da thuc hien cho website chat, gom backend, frontend, admin, user, bao mat va toi uu giao dien.

## 1. Chuan hoa cau truc API

Da dua API ve cau truc version `v1` ro rang, tach rieng admin va user.

### Admin API

Tat ca API admin da chuyen sang dang:

```text
/api/v1/admin/...
```

Bao gom:

- Dang nhap admin: `/api/v1/admin/login`
- Quan ly user: `/api/v1/admin/users`
- Chi tiet user: `/api/v1/admin/users/:id`
- Cap nhat quyen/khoa user: `/api/v1/admin/users/:id/access`
- Quan ly bao cao: `/api/v1/admin/reports`
- Chi tiet bao cao: `/api/v1/admin/reports/:id`
- Cap nhat trang thai bao cao: `/api/v1/admin/reports/:id/status`
- Thong ke bao cao: `/api/v1/admin/reports/stats`
- Quan ly luat ung xu: `/api/v1/admin/conduct-rules`
- Giam sat chat: `/api/v1/admin/chats/:id/messages`

Da xoa cac route cu khong dung cau truc nhu:

- `/api/admin/users`
- `/api/admin/conduct-rules`
- `/api/admin/chats/...`
- `/api/admin/v1/login`
- `/api/reports/:id` dung cho admin
- `/api/reports/stats` dung cho admin

### User API

Tat ca API user da chuyen sang dang:

```text
/api/v1/...
```

Bao gom:

- Dang nhap Google: `/api/v1/auth/google-login`
- Refresh token: `/api/v1/auth/refresh`
- Dang xuat: `/api/v1/auth/logout`
- Thong tin ca nhan: `/api/v1/users/me`
- Cap nhat thong tin ca nhan: `/api/v1/users/me`
- Xoa tai khoan: `/api/v1/users/me`
- Hoan tat ho so: `/api/v1/users/setup-profile`
- Gui bao cao: `/api/v1/reports`
- Lich su bao cao cua user: `/api/v1/reports/my-reports`
- Danh sach nguoi co the bao cao: `/api/v1/reports/reportable-users`
- Chat user: `/api/v1/chat/...`
- Tim nguoi chat: `/api/v1/match/...`

Da xoa cac route cu:

- `/api/auth`
- `/api/users`
- `/api/reports`
- `/api/chat`
- `/api/match`

## 2. Admin

Da them va sua cac chuc nang admin:

- Them nut dang xuat o admin.
- Admin xem danh sach user.
- Admin xem chi tiet tai khoan user.
- Admin cap nhat quyen truy cap va trang thai khoa user.
- Admin xem danh sach bao cao.
- Sua loi trang bao cao.
- Them phan trang cho danh sach user.
- Them phan trang cho bao cao.
- Admin click vao cuoc tro chuyen de xem chi tiet.
- Admin xem lich su tin nhan trong chi tiet cuoc tro chuyen.
- Admin quan ly luat ung xu.
- Admin co khu vuc quan ly goi VIP.

## 3. User

Da them va sua cac chuc nang ben user:

- Them tinh nang xoa tai khoan.
- Khi xoa tai khoan se xoa du lieu lien quan cua user.
- Sua trang Gioi thieu ban than bi khong hien thi het noi dung.
- Sua trang Cai dat.
- Sua trang Bao cao.
- Sua trang Tim nguoi tro chuyen.
- Click vao tim nguoi tro chuyen co the xem lich su cuoc tro chuyen theo luong da lam.
- Them khu vuc VIP o user, hien tai de trang thai "Chua phat trien".
- VIP user hien thi cac goi: 1 tuan, 15 ngay, 1 thang.
- Cac quyen VIP dang de "Chua phat trien":
  - Giu duoc hinh anh.
  - Xem ho va ten nguoi chat.
  - Doi giao dien.

## 4. Chat

Da sua va them cac phan lien quan chat:

- Chat noi dung duoc luu 90 ngay.
- Backend co tac vu tu dong don tin nhan qua han 90 ngay.
- Them phan trang cho chat.
- Toi uu hien thi nhom tin nhan bang React hooks.
- Admin co the giam sat va xem lich su tin nhan cua cuoc tro chuyen.
- API chat user da chuan hoa sang `/api/v1/chat`.
- API chat admin da chuan hoa sang `/api/v1/admin/chats`.

## 5. Bao cao

Da sua he thong bao cao:

- Sua loi trang bao cao dang bi loi.
- Them phan trang cho danh sach bao cao.
- User co the gui bao cao.
- User co the xem lich su bao cao cua minh.
- User chi bao cao duoc nguoi da tung noi chuyen gan day.
- Admin xem danh sach bao cao rieng qua `/api/v1/admin/reports`.
- Admin cap nhat trang thai bao cao.
- Admin co the khoa user tu bao cao voi cac muc khoa da co.
- Them thong ke bao cao that tu backend, khong con mock route cu.

## 6. Giao dien

Da dong bo lai bo cuc user va admin:

- Dong bo layout cac trang user.
- Chon mot kieu khung chinh, tranh vua border vua shadow trong cung mot cap.
- Cac trang khong can shadow/border trung lap da duoc fix.
- Trang Tim nguoi tro chuyen da bo bot khung thua theo yeu cau.
- Trang Bao cao, VIP, Cai dat da duoc can lai khung.
- Sua sidebar user cho cac muc:
  - Chat
  - Gioi thieu ban than
  - Cai dat
  - Bao cao

## 7. Toi uu React hooks

Da them va ap dung hooks de toi uu giao dien khi nhieu nguoi dung:

- Them `useDebouncedValue`.
- Them `usePagination`.
- Ap dung `useMemo`, `useCallback`, `memo` o cac trang can thiet.
- Toi uu cac danh sach lon nhu:
  - Admin users.
  - Admin reports.
  - Admin chats.
  - Tim nguoi tro chuyen.
  - Chat area.
  - Conduct rules.

Muc tieu la giam render lai khong can thiet khi co nhieu user truy cap cung luc.

## 8. Bao mat

Da them cac phan bao mat:

- Bao ve refresh token bang chu ky HMAC SHA-256.
- Refresh token moi co dang co chu ky:

```text
refresh:<tokenId>:<expiresAt>:<signature>
```

- Backend kiem tra chu ky truoc khi chap nhan refresh token.
- So sanh chu ky bang `timingSafeEqual`.
- Tach secret:
  - `REFRESH_TOKEN_SECRET`
  - `ACCESS_TOKEN_SECRET`
  - hoac dung chung `AUTH_TOKEN_SECRET`
- Them CSRF token cho cac request can bao ve.
- Them header bao mat trong backend.
- Chuan hoa proxy Next de forward cookie va CSRF token ve backend.

Can cau hinh production:

```env
REFRESH_TOKEN_SECRET=your-strong-refresh-secret
ACCESS_TOKEN_SECRET=your-strong-access-secret
```

## 9. Ket qua build

Da kiem tra build sau cac thay doi:

- Backend: `pnpm build` pass.
- Frontend: `next build` pass.

Frontend con canh bao cua Next.js:

```text
The "middleware" file convention is deprecated. Please use "proxy" instead.
```

Canh bao nay khong lam hong build, co the xu ly rieng o buoc sau.

## 10. Ghi chu viec nen lam tiep

- Doi `middleware.ts` sang `proxy.ts` theo khuyen nghi moi cua Next.js.
- Them trang UI hoan chinh cho quan ly VIP neu muon kich hoat that.
- Them thanh toan/gia han VIP neu sau nay can.
- Them test cho API `/api/v1`.
- Them migration database chinh thuc neu deploy production.
- Them co che rotate refresh token neu muon bao mat cao hon.
