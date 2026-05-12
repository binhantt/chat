# ChatApp Database Notes

Backend dùng PostgreSQL và TypeORM. Tài liệu này mô tả các nhóm entity chính và hướng mở rộng dữ liệu.

## Nhóm entity hiện có

### User

Lưu thông tin tài khoản và hồ sơ:

- Email.
- Password hash hoặc thông tin OAuth.
- Full name.
- Avatar.
- Gender.
- City.
- Bio.
- Birthday.
- Phone.
- Role.
- Trạng thái khóa nếu có.

### Conversation

Đại diện một cuộc trò chuyện giữa hai người dùng.

Nên có:

- `user1Id`.
- `user2Id`.
- `createdAt`.
- `updatedAt`.
- `lastMessageAt` để sort danh sách chat.
- Trạng thái nếu hỗ trợ end/hide/block.

### Message

Lưu tin nhắn trong conversation.

Nên có:

- `conversationId`.
- `senderId`.
- `content`.
- `createdAt`.
- `readAt` nếu hỗ trợ read receipt.

### Match/Queue

Lưu trạng thái ghép đôi hoặc hàng đợi matching.

Nên có:

- `userId`.
- `preferredGender`.
- `city`.
- `status`.
- `score` nếu dùng matching thông minh.
- `createdAt`.

### Report

Lưu báo cáo vi phạm.

Nên có:

- `reporterId`.
- `reportedUserId`.
- `reason`.
- `description`.
- `status`: `pending`, `reviewing`, `resolved`, `rejected`.
- `createdAt`.
- `updatedAt`.
- `resolvedByAdminId` nếu đã xử lý.

## Entity nên bổ sung

### UserInterest

Phục vụ matching theo sở thích.

- `userId`.
- `interest`.

### AdminAuditLog

Ghi nhận hành động admin.

- `adminId`.
- `action`.
- `targetType`.
- `targetId`.
- `metadata`.
- `createdAt`.

### ConversationParticipantState

Tách trạng thái cá nhân trong một conversation.

- `conversationId`.
- `userId`.
- `hiddenAt`.
- `blockedAt`.
- `endedAt`.
- `lastReadMessageId`.

## Matching score đề xuất

- Cùng thành phố: +40 điểm.
- Cùng sở thích: +20 điểm mỗi sở thích.
- Độ tuổi gần nhau: +20 điểm.
- Mục đích tham gia giống nhau: +20 điểm.

Người có điểm cao nhất trong queue nên được ưu tiên match trước.
