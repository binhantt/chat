# ChatApp

ChatApp là ứng dụng chat/matching giúp người dùng kết nối với người phù hợp trong cùng khu vực, bắt đầu cuộc trò chuyện nhanh và có cơ chế report/moderation rõ ràng để bảo vệ trải nghiệm cộng đồng.

## Cấu trúc dự án

- `frontend`: Next.js, React, Radix UI, Tailwind CSS.
- `backend`: NestJS, TypeORM, PostgreSQL, JWT/auth, matching, chat, report, admin.
- `docs`: tài liệu sản phẩm, setup, API contract, roadmap và database notes.

## Tính năng chính

- Đăng nhập bằng Google và email/password.
- Cập nhật hồ sơ người dùng.
- Tìm người để chat.
- Ghép đôi theo thành phố và giới tính.
- Tạo cuộc trò chuyện, gửi và xem tin nhắn.
- Nhận tin nhắn thời gian thực bằng SSE chat stream.
- Hiển thị trạng thái đang nhập.
- Kết thúc cuộc trò chuyện.
- Report người dùng vi phạm.
- Admin quản lý users, chats, reports, conduct rules và gói VIP.

## Tài liệu

- [Setup](docs/SETUP.md)
- [Features](docs/FEATURES.md)
- [Roadmap](docs/ROADMAP.md)
- [API Contract](docs/API-CONTRACT.md)
- [Database Notes](docs/DATABASE.md)
- [Project Ideas](PROJECT_IDEAS.md)

## Hướng phát triển

Ưu tiên tiếp theo của dự án:

1. Sửa toàn bộ text tiếng Việt bị lỗi mã hóa.
2. Chuẩn hóa API contract giữa frontend và backend.
3. Ổn định và hoàn thiện realtime chat bằng SSE chat stream.
4. Nâng cấp report/admin moderation.
5. Cải thiện matching bằng sở thích và mục đích tham gia.
6. Bổ sung thêm trạng thái hội thoại như đã đọc, online/offline nếu cần.
