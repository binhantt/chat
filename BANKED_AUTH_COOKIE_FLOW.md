# Banked Auth Cookie Flow

Tài liệu này mô tả cách luồng đăng nhập của `banked` đang hoạt động sau khi chuyển sang mô hình cookie an toàn hơn.

## Mục tiêu

- Không để frontend đọc hoặc tự ghi token nhạy cảm trong `document.cookie`.
- Giữ trạng thái đăng nhập bằng cookie `HttpOnly` do backend phát hành.
- Cho phép request tự mang cookie qua `withCredentials`.
- Giảm rủi ro lộ token trong JavaScript, local storage, hoặc code client.

## Ý tưởng chính

### 1. Backend tạo token

- Khi user đăng nhập bằng Google hoặc email/mật khẩu, backend tạo:
  - `accessToken`
  - `refreshToken`
- Hai token này được nhét vào cookie bằng `res.cookie(...)`.
- Cookie được set với các thuộc tính an toàn:
  - `HttpOnly`
  - `Secure` nếu môi trường phù hợp
  - `SameSite=Lax`

### 2. Frontend không giữ token

- Frontend chỉ giữ thông tin user không nhạy cảm trong store.
- Frontend không còn:
  - ghi token vào cookie bằng JavaScript
  - đọc token từ `document.cookie`
  - lưu password vào cookie
- Khi cần gọi API, frontend chỉ dùng `axios` với `withCredentials: true`.

### 3. Request tự mang cookie

- Vì `withCredentials` được bật, browser sẽ tự gửi cookie cùng request.
- Backend đọc cookie từ request để xác thực user.
- Nếu access token hết hạn, frontend gọi `POST /auth/refresh`.
- Backend kiểm tra refresh token trong cookie, tạo token mới, rồi set cookie mới cho browser.

### 4. Logout

- Khi user đăng xuất, frontend gọi `POST /auth/logout`.
- Backend xóa cookie auth.
- Frontend xóa state user trong store và chuyển về `/login`.

## Luồng hoạt động

### Đăng nhập

1. User bấm đăng nhập Google hoặc email/mật khẩu.
2. Frontend gọi API login.
3. Backend xác thực và tạo token.
4. Backend set cookie auth.
5. Backend trả về `user` để frontend hiển thị tên, avatar, trạng thái.
6. Frontend lưu `user` vào store.
7. UI tự chuyển vào `/chat`.

### Gọi API bình thường

1. Frontend gọi API qua `axiosClient`.
2. Browser tự gửi cookie theo request.
3. Middleware backend đọc cookie và xác thực user.
4. Request được xử lý như người dùng đã đăng nhập.

### Token hết hạn

1. Backend trả về `401` hoặc `403`.
2. `axiosClient` tự gọi `POST /auth/refresh`.
3. Backend kiểm tra refresh token trong cookie.
4. Backend tạo token mới và set lại cookie.
5. `axiosClient` retry request ban đầu.

### Đăng xuất

1. User bấm logout.
2. Frontend gọi `/auth/logout`.
3. Backend clear cookie.
4. Frontend xóa state user.
5. User quay về trang login.

## Điểm an toàn quan trọng

- `HttpOnly` ngăn JavaScript trên trang đọc cookie.
- `Secure` giúp cookie chỉ đi qua HTTPS khi có cấu hình phù hợp.
- `SameSite=Lax` giảm rủi ro CSRF ở nhiều tình huống phổ biến.
- Token không còn bị nhét vào local storage hoặc cookie do client tự ghi.
- Password không còn được lưu trong cookie.

## Điều cần nhớ

- Cookie vẫn có thể nhìn thấy trong DevTools của trình duyệt, nhưng JS không đọc được nếu cookie là `HttpOnly`.
- Đây là điều bình thường của cơ chế cookie. Mục tiêu là ngăn mã độc hoặc script chạy trên trang đọc token.
- Nếu muốn bảo mật mạnh hơn nữa, có thể chuyển sang session opaque id thay vì JWT trong cookie.

## File liên quan

- `backend/src/infrastructure/security/AuthCookies.ts`
- `backend/src/infrastructure/webserver/controllers/AuthController.ts`
- `React_Chat/src/shared/api/axiosClient.ts`
- `React_Chat/src/features/auth/store/auth.store.ts`
- `React_Chat/src/features/auth/components/ProtectedRoute.tsx`
- `React_Chat/src/features/chat/components/ChatLayout.tsx`

