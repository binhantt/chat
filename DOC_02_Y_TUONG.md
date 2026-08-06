# DOC 02 - Product Vision and Development Direction

Updated: 30/05/2026

This document records the product vision, existing features, and recommended next steps.

## Product Goals

Stranger is an online connection and chat application. Users can quickly log in with Google, enter chat, find matching people, report violations, and manage their personal profile. The manager area is used to monitor users, chats, reports, conduct rules, and server resources.

## User Flow

1. Go to `/login`.
2. Log in with Google.
3. If no profile exists, still allow chat first; user can view/edit profile later.
4. Go to main page `/`.
5. Use tabs:
   - Chat
   - Website
   - Personal
   - VIP
   - Settings
   - Reports

## Chat Flow

1. User enters chat page.
2. Choose search people / match people.
3. System creates conversation when match succeeds.
4. Both sides can like/view profile depending on chat logic.
5. If one side exits/ends the room, the other side can no longer continue messaging.
6. New messages are pushed via SSE.

## Report Flow

1. User can only report someone they recently chatted with.
2. User enters reason, title/content.
3. Manager goes to `/admin/reports`.
4. Manager views reporter, reported user, content.
5. Manager can:
   - reject report
   - confirm violation
   - temporarily/permanently lock
   - unlock if report status changes

## Conduct Flow

1. Manager goes to `/admin/conduct`.
2. Click `Add Rule`.
3. Enter violation content and notes.
4. Active rules are used by conduct service to check messages.
5. If message violates a rule, sending is blocked.

## Manager Flow

1. Go to `/admin/login`.
2. Log in as manager.
3. Go to `/admin`.
4. Sidebar has pages:
   - Dashboard
   - Users
   - Messages
   - Conduct
   - Reports
   - VIP Packages
   - Settings
5. Mobile uses separate bottom navigation.

## UI Ideas to Keep

- Light background: `#F4F9FF`.
- Primary: `#3B82F6`.
- Text: `#0F172A`.
- Dark mode uses CSS variables so admin and user switch simultaneously.
- Card radius 8px, avoid overly nested cards.
- Admin should look like a management dashboard: clean, easy to scan, clear status.
- User app can be softer but still minimal.

## Feature Ideas - Next Steps

### User

- Add custom avatar upload, not just Google avatar.
- Add more detailed partner profile view.
- Add block/report directly in chat frame.
- Add online/offline status.
- Add new message notifications.
- Add chat history with date filters.

### Chat

- Cursor pagination for old messages.
- More visible typing indicator.
- Read receipts if needed.
- Smart auto-scroll: only scroll when user is at bottom of chat frame.
- Message length limit.
- Send rate limiting.

### Matching

- Filter by city, gender, age range.
- Prioritize matching online users.
- Reduce repeating recently met people.
- Match timeout with clear reason notification.

### Report/Conduct

- Add severity for conduct rules.
- Add statistics for most violated rules.
- Add manager action history.
- Add internal notes when processing reports.
- Add audit log for lock/unlock.

### Manager Dashboard

- New users chart by day.
- Reports chart by status.
- Backend CPU/RAM only updates on refresh click.
- Alert widget: pending reports, locked users, active chats.

### VIP

- Add trial package.
- Add payment history.
- Add benefits per package.
- Add mock checkout or payment integration later.

## Technical Ideas

- Move `middleware.ts` to `proxy.ts` when Next requires it.
- Separate user/admin API clients more clearly.
- Create `docs` folder later if documentation grows.
- Create dev seed data.
- Create backend/frontend health check scripts.
- Create tests for auth, report, conduct, chat.
