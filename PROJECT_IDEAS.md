# Y tuong phat trien du an ChatApp

## 1. Tong quan nhanh

Du an hien tai la mot ung dung chat co 2 phan:

- `frontend`: Next.js, React, Radix UI, Tailwind CSS.
- `backend`: NestJS, TypeORM, PostgreSQL, JWT/auth, matching, chat, report, admin.

Chuc nang chinh da co:

- Dang nhap bang Google va email/password.
- Cap nhat ho so nguoi dung: ten, avatar, gioi tinh, thanh pho, bio, ngay sinh, so dien thoai.
- Tim nguoi de chat.
- Ghep doi nguoi dung theo thanh pho va gioi tinh doi lap.
- Tao cuoc tro chuyen va gui/xem tin nhan.
- Bao cao nguoi dung vi pham.
- Admin quan ly users, chats, reports.

## 2. Nhan xet ve huong san pham

Y tuong cot loi cua du an kha ro: tao mot nen tang chat an toan, co ghep doi nhanh theo thong tin ca nhan co ban. Diem manh la du an da co san luong nghiep vu tuong doi day du: auth, user profile, chat, match, report va admin moderation.

Neu phat trien tiep, minh nghi nen dinh vi san pham theo huong:

> ChatApp la ung dung giup nguoi dung ket noi voi nguoi phu hop trong cung khu vuc, bat dau tro chuyen nhanh, co co che bao ve va quan tri noi dung ro rang.

## 3. Van de nen uu tien sua

### 3.1. Sua loi hien thi tieng Viet

Nhieu file frontend/backend dang hien thi tieng Viet bi loi ma hoa, vi du `ChÃ o má»«ng`, `TÃ¬m kiáº¿m`, `KhÃ´ng tÃ¬m tháº¥y`. Viec nay lam trai nghiem nguoi dung kem chuyen nghiep.

De xuat:

- Chuan hoa tat ca file ve UTF-8.
- Quet lai text hien thi tren UI va message API.
- Tao mot file constants/i18n nho de gom cac cau thong bao dung lap lai.

### 3.2. Dong bo frontend va backend API

Frontend hien co cac route API trong `app/api/...`, trong khi backend cung co API rieng bang NestJS. Nen xac dinh ro:

- Frontend API route chi dong vai tro proxy den backend.
- Backend la nguon nghiep vu chinh.
- Khong nen de logic nghiep vu bi lap giua Next.js API route va NestJS service.

### 3.3. Bao mat va moderation

Du an co report va ban user, day la nen tang tot. Nen bo sung:

- Rate limit cho gui tin nhan, dang nhap, tao report.
- Loc noi dung tin nhan co tu khoa nguy hiem.
- Luu audit log cho hanh dong admin.
- Trang thai xu ly report ro hon: `pending`, `reviewing`, `resolved`, `rejected`.

## 4. Y tuong tinh nang moi

### 4.1. Ho so ca nhan co chieu sau hon

Them cac truong:

- So thich.
- Muc dich tham gia: ket ban, hoc tap, tam su, giai tri.
- Ngon ngu uu tien.
- Trang thai online/offline.

Loi ich: matching tot hon va nguoi dung de bat dau cau chuyen hon.

### 4.2. Ghep doi thong minh hon

Hien tai matching dua vao thanh pho va gioi tinh doi lap. Co the nang cap thanh diem phu hop:

- Cung thanh pho: +40 diem.
- Cung so thich: +20 diem moi so thich.
- Do tuoi gan nhau: +20 diem.
- Muc dich tham gia giong nhau: +20 diem.

Sau do chon nguoi co diem cao nhat trong queue thay vi chi lay nguoi vao hang doi som nhat.

### 4.3. Loi moi tro chuyen

Sau khi ghep doi, app co the hien 3 cau goi y:

- "Hom nay ban co gi vui khong?"
- "Ban thich dia diem nao nhat o thanh pho nay?"
- "Neu co mot ngay ranh, ban se lam gi?"

Loi ich: giam tinh trang match xong nhung khong ai nhan tin.

### 4.4. Chat realtime dung Socket.IO

Backend da co dependency Socket.IO. Nen hoan thien realtime:

- Tin nhan moi hien ngay khong can reload.
- Typing indicator.
- Read receipt.
- Online status.

### 4.5. Chan va an cuoc tro chuyen

Nen tach ro:

- `block`: khong cho nguoi kia nhan tin tiep.
- `hide`: chi an cuoc tro chuyen khoi danh sach cua minh.
- `end`: ket thuc cuoc tro chuyen nhung van co the xem lich su.

### 4.6. Admin dashboard co so lieu hanh dong

Them cac chi so:

- So user moi theo ngay.
- So cuoc tro chuyen moi.
- So report dang cho xu ly.
- Top ly do report.
- Ty le user bi khoa.

Dashboard nen giup admin quyet dinh nhanh, khong chi hien danh sach.

## 5. De xuat roadmap

### Giai doan 1: Lam sach nen tang

- Sua loi tieng Viet bi ma hoa.
- Chuan hoa API contract giua frontend va backend.
- Kiem tra lai auth flow va middleware.
- Viet README huong dan chay ca frontend/backend.

### Giai doan 2: Hoan thien chat

- Them realtime message.
- Them typing/read status.
- Them danh sach conversation co last message.
- Them block/hide/end conversation tren UI.

### Giai doan 3: Nang cap matching

- Bo sung so thich va muc dich tham gia.
- Tinh diem phu hop.
- Them goi y cau hoi sau match.
- Them timeout va thong bao queue ro rang hon.

### Giai doan 4: Tang an toan

- Rate limit.
- Audit log admin.
- Trang thai report chi tiet.
- Cong cu khoa/mo khoa user minh bach.

## 6. Y tuong cau truc tai lieu

Nen co them cac file docs:

- `docs/SETUP.md`: cach cai dat va chay du an.
- `docs/API-CONTRACT.md`: danh sach API frontend dang goi.
- `docs/FEATURES.md`: mo ta tinh nang theo user/admin.
- `docs/ROADMAP.md`: viec can lam theo giai doan.
- `docs/DATABASE.md`: entity va quan he database.

## 7. Viec nen lam ngay

Neu chi chon 5 viec co tac dong cao nhat, minh de xuat:

1. Sua toan bo text tieng Viet bi loi ma hoa.
2. Viet `docs/SETUP.md` de nguoi moi co the chay du an.
3. Hoan thien realtime chat bang Socket.IO.
4. Nang cap report/admin moderation.
5. Cai thien matching bang so thich va muc dich tham gia.

## 8. Ket luan

Du an da co khung kha tot cho mot app chat/matching. Huong phat trien nen tap trung vao 3 chu: ro rang, an toan, co cam xuc. Ro rang trong luong API va UI, an toan trong moderation/report, va co cam xuc trong matching, ho so, goi y tro chuyen.

Neu lam theo roadmap tren, du an se tu mot demo chat co tinh nang co ban thanh mot san pham co cau chuyen va co kha nang mo rong that su.
