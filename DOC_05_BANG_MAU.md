# DOC 05 - Bang mau giao dien

Cap nhat: 30/05/2026

Tai lieu nay ghi lai bang mau dang dung cho giao dien `Frontend`. Muc tieu la giu login, user, chat va admin cung mot tong mau, tranh sua moi trang mot kieu.

## Mau goc

| Ten | Gia tri | Dung cho |
| --- | --- | --- |
| Nen sang | `#F4F9FF` | Nen chinh light mode |
| Xanh chinh | `#3B82F6` | Button, icon active, border nhan manh |
| Chu chinh | `#0F172A` | Tieu de va noi dung light mode |
| Chu phu | `#475569` | Mo ta, subtitle, label phu |
| Cyan | `#22D3EE` | Diem nhan phu, gradient nhe |
| Vang | `#F59E0B` | VIP, canh bao, diem nhan nho |
| Do | `#DC2626` | Loi, khoa tai khoan, hanh dong nguy hiem |
| Xanh la | `#16A34A` | Thanh cong, hoat dong |

## Light mode

```css
:root {
  --bg: #F4F9FF;
  --primary: #3B82F6;
  --text: #0F172A;

  --auth-bg: #F4F9FF;
  --auth-border: #3B82F6;
  --auth-control: #3B82F6;
  --auth-text: #0F172A;
  --auth-muted: #475569;
  --auth-panel: rgba(255, 255, 255, 0.94);
  --auth-panel-soft: rgba(255, 255, 255, 0.72);
  --auth-panel-lift: rgba(239, 246, 255, 0.92);
  --auth-line: rgba(59, 130, 246, 0.18);
  --auth-cyan: #22D3EE;
  --auth-gold: #F59E0B;
}
```

## Dark mode

```css
[data-theme="dark"] {
  --bg: #0B1120;
  --primary: #60A5FA;
  --text: #E2E8F0;

  --auth-bg: #0B1120;
  --auth-border: #1D4ED8;
  --auth-control: #3B82F6;
  --auth-text: #E2E8F0;
  --auth-muted: #94A3B8;
  --auth-panel: rgba(15, 23, 42, 0.94);
  --auth-panel-soft: rgba(30, 41, 59, 0.74);
  --auth-panel-lift: rgba(17, 24, 39, 0.96);
  --auth-line: rgba(96, 165, 250, 0.24);
  --auth-cyan: #22D3EE;
  --auth-gold: #FBBF24;
}
```

## Quy tac dung mau

- Nen trang: dung `--auth-bg` hoac `--bg`.
- Panel/card: dung `--auth-panel`, khong dung nen xam mac dinh cua browser.
- Panel nhe ben trong: dung `--auth-panel-soft` hoac `--auth-panel-lift`.
- Button chinh: dung `--auth-control`.
- Border: dung `--auth-line`; chi dung border trong component, tranh vien ngoai qua day.
- Chu chinh: dung `--auth-text`.
- Chu phu: dung `--auth-muted`.
- Trang VIP: duoc dung `--auth-gold` lam diem nhan.
- Trang canh bao/bao cao/khoa tai khoan: dung do `#DC2626` hoac Radix `red`.
- Trang thanh cong/hoat dong: dung xanh la `#16A34A` hoac Radix `green`.

## File dang quan ly mau

- `Frontend/app/globals.css`: khai bao CSS variables light/dark.
- `Frontend/features/athu/styles/authTheme.ts`: map bien mau de component dung chung.
- `Frontend/features/admin/styles/*Theme.ts`: style panel rieng cho admin.
- `Frontend/features/chat/styles/*`: style rieng cho khung chat.

## Luu y khi sua giao dien

- Khong tao bang mau moi trong tung component neu mau da co trong `authTheme`.
- Khong dung qua nhieu gradient. Neu can nhan manh, dung gradient nhe tu `--auth-control` sang `--auth-cyan`.
- Border radius giu quanh `8px` de dong bo voi Radix UI.
- Neu them dark mode, phai them bien tuong ung trong `[data-theme="dark"]`.
- Neu them mau moi, cap nhat file nay va `globals.css` cung luc.
