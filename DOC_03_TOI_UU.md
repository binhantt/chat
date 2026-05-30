# DOC 03 - Toi uu hieu nang va bao mat

Cap nhat: 30/05/2026

Tai lieu nay ghi cac quy tac toi uu backend, frontend va database can giu khi code tiep.

## Nguyen tac chung

- Khong goi API lap neu data da co cache hop ly.
- Khong query DB trong loop neu co the dung JOIN hoac `IN (...)`.
- Khong `SELECT *` cho endpoint danh sach.
- Danh sach lon dung cursor pagination, tranh offset lon.
- Middleware/proxy chi match route can bao ve.
- Refresh token chi khi access token loi/het han.
- Logout nen clear cookie/token nhanh, tranh query DB neu khong can.

## Backend

### Tranh N+1 query

Khong nen:

```ts
for (const user of users) {
  await repository.find({ where: { userId: user.id } });
}
```

Nen:

```ts
await repository
  .createQueryBuilder("item")
  .where("item.userId IN (:...userIds)", { userIds })
  .getMany();
```

Hoac dung JOIN:

```sql
SELECT users.id, users.email, reports.id
FROM users
LEFT JOIN reports ON reports.reported_user_id = users.id;
```

### Cac diem da toi uu

- `report.service.ts`
  - `findMyReports` batch recent partners bang 1 raw query thay vi moi report mot query.
  - `updateStatus` khong query lai user sau khi `lockFromReport`/`unlockFromReport`.
- `match.service.ts`
  - Bulk update active conversations bang `In(conversationIds)`.
  - `findMatch` dung `IN (:...preferredGenders)` thay vi query tung gender.
- `users.service.ts`
  - Manager users dung cursor pagination va select field can thiet.
- `chat.service.ts`
  - Manager chats dung cursor pagination.
- `report.service.ts`
  - Manager reports dung cursor pagination, select alias field can thiet.

### Pagination

Khong nen:

```sql
SELECT *
FROM messages
ORDER BY created_at DESC
LIMIT 20 OFFSET 10000;
```

Nen:

```sql
SELECT id, content, created_at
FROM messages
WHERE created_at < $1
ORDER BY created_at DESC
LIMIT 20;
```

Voi cursor gom time + id:

```sql
WHERE created_at < :createdAt
   OR (created_at = :createdAt AND id < :id)
ORDER BY created_at DESC, id DESC
LIMIT :limit;
```

### Index nen co

Messages:

```sql
CREATE INDEX idx_room_created
ON messages(room_id, created_at DESC);

CREATE INDEX idx_user_created
ON messages(user_id, created_at DESC);
```

Conversations:

- `user1Id, status, updatedAt`
- `user2Id, status, updatedAt`
- `status, updatedAt, id`
- `updatedAt, id`

Reports:

- `reporterId, createdAt`
- `reportedUserId, createdAt`
- `status, createdAt, id`
- `createdAt, id`

Users:

- `createdAt, id`
- `isActive, createdAt, id`
- `lockType, lockedUntil`
- `city, gender, isActive`

### Select field can thiet

Khong nen lay het:

```ts
repository.find({ relations: ["messages", "reports"] });
```

Nen dung query builder:

```ts
repository
  .createQueryBuilder("user")
  .select("user.id", "id")
  .addSelect("user.email", "email")
  .addSelect("user.fullName", "fullName")
  .getRawMany();
```

### Auth/token

- Access token ngan han.
- Refresh token chi goi khi access token loi/het han.
- Neu refresh token het han thi logout.
- Neu user bi khoa, clear cookie va day user ve login.
- JWT payload nho: `sub`, `role` neu backend can; khong nhot object lon.

### Logout

Nen:

```ts
res.clearCookie("access_token");
res.clearCookie("refresh_token");
return { success: true };
```

Khong nen await cleanup nang neu logout chi dung JWT/cookie stateless.

### Logging

Da co interceptor log API:

```text
[API] GET /api/v1/users/me 1ms
```

Dung log nay de biet bottleneck:

- `Waiting/TTFB` cao: backend/DB.
- `Content Download` cao: payload lon.
- `Stalled` cao: browser/network.

## Frontend

### Khong goi API lap

- `AuthContext` cache `/api/v1/users/me` trong bo nho.
- `/admin/*` khong goi `/users/me` bang client AuthProvider.
- Sidebar admin `prefetch={false}` de khong goi data truoc khi click.
- API manager GET co inflight dedupe ngan han.

### Refresh token co dieu kien

Khong nen:

```ts
if (response.status === 401 || response.status === 403) {
  await refresh();
}
```

Nen:

```ts
if (response.status === 401 && message.includes("access token")) {
  await refresh();
}
```

403 CSRF xu ly rieng.

### RSC va Client Component

Dung RSC khi:

- Chi render UI tinh.
- Doc cookie/header.
- Fetch server-side.

Dung `"use client"` khi:

- Can `useState`, `useEffect`, event handler.
- Can Zustand hook.
- Can browser API.

### Admin layout

- Desktop: sidebar trai.
- Mobile: bottom navigation.
- Active menu lay tu `x-current-path`.
- Navbar mobile gon, khong nhet search dai.

### UI

- Dung Radix UI Themes.
- Dung icon Radix.
- Card radius 8px.
- Tranh card long card.
- Text khong de tran container.
- Mobile can padding bottom de khong bi bottom nav che.

## Check truoc khi push

Frontend:

```bash
cd Frontend
pnpm.cmd build
```

Backend:

```bash
cd backend
pnpm.cmd build
```

Lint nhanh file vua sua:

```bash
cd Frontend
pnpm.cmd run lint -- "features/admin/components/users"

cd backend
.\node_modules\.bin\eslint.cmd src/report/report.service.ts src/match/match.service.ts
```

