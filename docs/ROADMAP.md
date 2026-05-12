# ChatApp Roadmap

## Giai đoạn 1: Làm sạch nền tảng

- Sửa toàn bộ text tiếng Việt bị lỗi mã hóa.
- Chuẩn hóa API contract giữa frontend và backend.
- Kiểm tra lại auth flow và middleware.
- Viết hướng dẫn setup rõ ràng cho cả frontend/backend.

## Giai đoạn 2: Hoàn thiện chat

- Thêm realtime message bằng Socket.IO.
- Thêm typing indicator.
- Thêm read receipt.
- Thêm online/offline status.
- Thêm danh sách conversation có last message.
- Thêm block/hide/end conversation trên UI.

## Giai đoạn 3: Nâng cấp matching

- Bổ sung sở thích.
- Bổ sung mục đích tham gia: kết bạn, học tập, tâm sự, giải trí.
- Tính điểm phù hợp theo thành phố, sở thích, độ tuổi và mục đích tham gia.
- Chọn người có điểm cao nhất trong queue.
- Thêm gợi ý câu hỏi sau match.
- Thêm timeout và trạng thái queue rõ ràng hơn.

## Giai đoạn 4: Tăng an toàn

- Rate limit cho đăng nhập, gửi tin nhắn và tạo report.
- Lọc nội dung tin nhắn có từ khóa nguy hiểm.
- Audit log cho hành động admin.
- Trạng thái report chi tiết: `pending`, `reviewing`, `resolved`, `rejected`.
- Công cụ khóa/mở khóa user minh bạch hơn.

## 5 việc nên làm ngay

1. Sửa toàn bộ text tiếng Việt bị lỗi mã hóa.
2. Hoàn thiện `docs/SETUP.md`.
3. Hoàn thiện realtime chat bằng Socket.IO.
4. Nâng cấp report/admin moderation.
5. Cải thiện matching bằng sở thích và mục đích tham gia.
