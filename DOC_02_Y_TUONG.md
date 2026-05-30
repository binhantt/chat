# DOC 02 - Y tuong va huong phat trien

Cap nhat: 30/05/2026

Tai lieu nay ghi lai y tuong san pham, chuc nang da co va cac viec nen lam tiep.

## Muc tieu san pham

Nguoi La la ung dung ket noi va tro chuyen truc tuyen. Nguoi dung co the dang nhap nhanh bang Google, vao chat, tim nguoi phu hop, bao cao vi pham va quan ly ho so ca nhan. Khu manager dung de theo doi user, chat, report, rule ung xu va tai nguyen server.

## Luong user

1. Vao `/login`.
2. Dang nhap Google.
3. Neu chua co ho so thi van cho vao chat truoc, sau do co the xem/sua ho so.
4. Vao trang chinh `/`.
5. Dung tab:
   - Chat
   - Website
   - Ca nhan
   - VIP
   - Cai dat
   - Bao cao

## Luong chat

1. User vao trang chat.
2. Chon tim nguoi/ghep doi.
3. He thong tao conversation khi match thanh cong.
4. Hai ben co the thich/xem ho so tuy logic chat.
5. Neu mot ben thoat/ket thuc phong, ben con lai khong the tiep tuc nhan tin.
6. Tin nhan moi duoc day qua SSE.

## Luong bao cao

1. User chi bao cao nguoi da noi chuyen gan nhat.
2. User nhap ly do, tieu de/noi dung.
3. Manager vao `/admin/reports`.
4. Manager xem nguoi bao cao, nguoi bi bao cao, noi dung.
5. Manager co the:
   - tu choi report
   - xac nhan vi pham
   - khoa tam thoi/vinh vien
   - mo khoa neu report bi sua trang thai

## Luong ung xu

1. Manager vao `/admin/conduct`.
2. Bam `Them luat`.
3. Nhap noi dung vi pham va ghi chu.
4. Rule active se duoc conduct service dung de check message.
5. Neu message vi pham thi chan gui tin.

## Luong manager

1. Vao `/admin/login`.
2. Dang nhap manager.
3. Vao `/admin`.
4. Sidebar co cac trang:
   - Tong quan
   - Nguoi dung
   - Tin nhan
   - Ung xu
   - Bao cao
   - Goi VIP
   - Cai dat
5. Mobile dung bottom nav rieng.

## Y tuong UI nen giu

- Mau nen sang: `#F4F9FF`.
- Primary: `#3B82F6`.
- Text: `#0F172A`.
- Dark mode dung CSS variables de admin va user doi cung luc.
- Card radius 8px, khong long card qua nhieu.
- Admin nen giong dashboard quan tri: gon, de scan, ro trang thai.
- User app co the mem hon nhung van toi gian.

## Y tuong tinh nang tiep theo

### User

- Them upload avatar rieng, khong chi lay Google avatar.
- Them trang xem profile partner ro hon.
- Them block/report ngay trong khung chat.
- Them trang thai online/offline.
- Them thong bao tin nhan moi.
- Them lich su chat co filter theo ngay.

### Chat

- Cursor pagination cho message cu.
- Typing indicator ro hon.
- Read receipt neu can.
- Auto scroll thong minh: chi scroll khi user dang o cuoi khung chat.
- Gioi han do dai tin nhan.
- Rate limit gui tin.

### Matching

- Bo loc theo thanh pho, gioi tinh, do tuoi.
- Uu tien match nguoi online.
- Giam lap lai nguoi da gap gan day.
- Timeout match va thong bao ro ly do.

### Report/Conduct

- Them severity cho rule ung xu.
- Them thong ke rule nao bi vi pham nhieu.
- Them lich su action manager.
- Them note noi bo khi xu ly report.
- Them audit log cho khoa/mo khoa.

### Manager dashboard

- Bieu do user moi theo ngay.
- Bieu do report theo trang thai.
- CPU/RAM backend chi cap nhat khi bam refresh.
- Widget canh bao: report cho xu ly, user bi khoa, chat dang active.

### VIP

- Them goi dung thu.
- Them lich su thanh toan.
- Them quyen loi theo package.
- Them mock checkout hoac tich hop payment sau.

## Y tuong ky thuat

- Chuyen `middleware.ts` sang `proxy.ts` khi Next yeu cau.
- Tach API client user/admin ro rang hon.
- Tao folder `docs` sau nay neu tai lieu nhieu.
- Tao seed data dev.
- Tao script health check backend/frontend.
- Tao test cho auth, report, conduct, chat.

