# ChatApp Frontend

The ChatApp frontend is built with Next.js, React, Radix UI, and Tailwind CSS.

## Run Development

```bash
npm install
npm run dev
```

Default frontend runs at `http://localhost:3000`.

## Environment Variables

Create `.env` or `.env.local` from the template:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

Full environment variable details: [`../DOC_07_ENV.md`](../DOC_07_ENV.md).

## Frontend Role

- Display UI for users and admins.
- Call backend API via API client or `app/api/...` proxy routes.
- Manage auth state on client.
- Display chat, matching, profile, reports, and admin dashboard.

## API Principles

- Backend NestJS is the primary business logic source.
- Frontend API routes should only proxy/adapter requests.
- Don't replicate matching, chat, report, or moderation logic on frontend.

See also: [`../docs/API-CONTRACT.md`](../docs/API-CONTRACT.md).
