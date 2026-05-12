# ChatApp API Contract

Tài liệu này mô tả vai trò giữa frontend API routes và backend API để tránh lặp logic nghiệp vụ.

## Nguyên tắc

- Backend NestJS là nguồn nghiệp vụ chính.
- Frontend Next.js API routes chỉ nên đóng vai trò proxy, adapter hoặc bảo vệ token/cookie.
- Không đặt logic matching, report, chat hoặc admin moderation ở cả hai phía cùng lúc.
- Mọi thay đổi response backend cần được cập nhật vào frontend API client tương ứng.

## Nhóm API chính

### Auth

- Đăng ký.
- Đăng nhập email/password.
- Đăng nhập Google.
- Lấy thông tin user hiện tại.
- Đăng xuất hoặc xóa token phía client.

### Users/Profile

- Lấy hồ sơ người dùng.
- Cập nhật tên, avatar, giới tính, thành phố, bio, ngày sinh, số điện thoại.
- Tìm kiếm người dùng.
- Khóa/mở khóa user ở admin.

### Matching

- Vào hàng đợi ghép đôi.
- Tìm người phù hợp theo thành phố và giới tính.
- Tạo match.
- Tạo conversation sau khi match.

### Chat

- Lấy danh sách conversation.
- Lấy messages theo conversation.
- Gửi message.
- Realtime events: new message, typing, read receipt, online status.

### Reports

- Tạo report.
- Lấy danh sách report cho admin.
- Lấy thống kê report.
- Cập nhật trạng thái report.
- Ghi nhận hành động moderation.

## Trạng thái report đề xuất

- `pending`: report mới tạo.
- `reviewing`: admin đang xem xét.
- `resolved`: đã xử lý và có hành động.
- `rejected`: report không hợp lệ hoặc không đủ bằng chứng.

## API proxy frontend

Các route trong `frontend/app/api/...` nên:

- Đọc token/cookie nếu cần.
- Forward request sang backend.
- Chuẩn hóa lỗi trả về UI.
- Không tự tạo rule nghiệp vụ riêng.

## Checklist khi thêm API mới

- Backend có service/controller rõ ràng.
- DTO có validation.
- Frontend có API client hoặc proxy route tương ứng.
- UI xử lý loading, empty state và error state.
- Có mô tả trong tài liệu này nếu API ảnh hưởng luồng chính.
