# DOC 03 - Performance Optimization and Security

Updated: 30/05/2026

This document records the optimization rules for backend, frontend, and database that should be maintained during development.

## General Principles

- Do not call API repeatedly if data is already reasonably cached.
- Do not query DB in a loop if JOIN or `IN (...)` can be used.
- No `SELECT *` for list endpoints.
- Use cursor pagination for large lists, avoid large offsets.
- Middleware/proxy should only match routes that need protection.
- Only refresh token when access token fails/expires.
- Logout should clear cookie/token quickly, avoid DB query if not needed.

## Backend

### Avoid N+1 Queries

Don't:

```ts
for (const user of users) {
  await repository.find({ where: { userId: user.id } });
}
```

Do:

```ts
await repository
  .createQueryBuilder("item")
  .where("item.userId IN (:...userIds)", { userIds })
  .getMany();
```

Or use JOIN:

```sql
SELECT users.id, users.email, reports.id
FROM users
LEFT JOIN reports ON reports.reported_user_id = users.id;
```

### Already Optimized Points

- `report.service.ts`
  - `findMyReports` batches recent partners with 1 raw query instead of 1 query per report.
  - `updateStatus` does not re-query user after `lockFromReport`/`unlockFromReport`.
- `match.service.ts`
  - Bulk update active conversations using `In(conversationIds)`.
  - `findMatch` uses `IN (:...preferredGenders)` instead of querying each gender.
- `users.service.ts`
  - Manager users uses cursor pagination and selects only needed fields.
- `chat.service.ts`
  - Manager chats uses cursor pagination.
- `report.service.ts`
  - Manager reports uses cursor pagination, selects aliased fields as needed.

### Pagination

Don't:

```sql
SELECT *
FROM messages
ORDER BY created_at DESC
LIMIT 20 OFFSET 10000;
```

Do:

```sql
SELECT id, content, created_at
FROM messages
WHERE created_at < $1
ORDER BY created_at DESC
LIMIT 20;
```

With cursor using time + id:

```sql
WHERE created_at < :createdAt
   OR (created_at = :createdAt AND id < :id)
ORDER BY created_at DESC, id DESC
LIMIT :limit;
```

### Recommended Indexes

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

### Select Only Needed Fields

Don't fetch everything:

```ts
repository.find({ relations: ["messages", "reports"] });
```

Use query builder:

```ts
repository
  .createQueryBuilder("user")
  .select("user.id", "id")
  .addSelect("user.email", "email")
  .addSelect("user.fullName", "fullName")
  .getRawMany();
```

### Auth/Token

- Short-lived access token.
- Only refresh token when access token fails/expires.
- If refresh token expires, logout.
- If user is locked, clear cookie and redirect to login.
- Small JWT payload: `sub`, `role` if backend needs; don't stuff large objects.

### Logout

Do:

```ts
res.clearCookie("access_token");
res.clearCookie("refresh_token");
return { success: true };
```

Don't await heavy cleanup if logout only uses stateless JWT/cookie.

### Logging

API logging interceptor already exists:

```text
[API] GET /api/v1/users/me 1ms
```

Use this log to identify bottlenecks:

- High `Waiting/TTFB`: backend/DB.
- High `Content Download`: large payload.
- High `Stalled`: browser/network.

## Frontend

### Don't Call API Repeatedly

- `AuthContext` caches `/api/v1/users/me` in memory.
- `/admin/*` does not call `/users/me` via client AuthProvider.
- Admin sidebar uses `prefetch={false}` to avoid fetching data before click.
- Manager GET APIs have short-lived inflight dedupe.

### Conditional Token Refresh

Don't:

```ts
if (response.status === 401 || response.status === 403) {
  await refresh();
}
```

Do:

```ts
if (response.status === 401 && message.includes("access token")) {
  await refresh();
}
```

Handle 403 CSRF separately.

### RSC vs Client Component

Use RSC when:

- Only rendering static UI.
- Reading cookie/header.
- Server-side fetching.

Use `"use client"` when:

- Need `useState`, `useEffect`, event handlers.
- Need Zustand hooks.
- Need browser APIs.

### Admin Layout

- Desktop: left sidebar.
- Mobile: bottom navigation.
- Active menu from `x-current-path`.
- Mobile navbar should be compact, don't stuff long search bars.

### UI

- Use Radix UI Themes.
- Use Radix icons.
- Card radius 8px.
- Avoid card-in-card nesting.
- Text should not overflow container.
- Mobile needs bottom padding to avoid bottom nav overlap.

## Pre-Push Checks

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

Quick lint on recently changed files:

```bash
cd Frontend
pnpm.cmd run lint -- "features/admin/components/users"

cd backend
.\node_modules\.bin\eslint.cmd src/report/report.service.ts src/match/match.service.ts
```
