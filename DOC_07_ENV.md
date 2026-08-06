# Environment Variables Documentation

This document contains the `.env` variables currently used by frontend and backend. Do not commit actual `.env` files if they contain production secrets; only commit `.env.example`.

## Table of Contents

- [Related Files](#related-files)
- [Shared Variables](#shared-variables)
- [Backend `.env`](#backend-env)
- [Frontend `.env`](#frontend-env)
- [Security Notes](#security-notes)

## Related Files

- `backend/.env`: backend local run config.
- `backend/.env.example`: backend environment variable template.
- `Frontend/.env`: frontend local run config.
- `Frontend/.env.example`: frontend environment variable template.
- `Frontend/lib/env.ts`: contains shared frontend variables, e.g. `BACKEND_URL` and `APP_URL`.
- `backend/src/database/postgres.config.ts`: reads PostgreSQL connection variables.
- `backend/src/security/security.config.ts`: reads CORS and frontend URL variables.
- `backend/src/auth/services/auth-token.service.ts`: reads access/refresh token signing secrets.
- `backend/src/auth/services/google-auth.service.ts`: reads Google client ID.
- `backend/src/analytics/analytics.service.ts`: reads `ANALYTICS_SALT`.

## Shared Variables

| Variable | Description | Local Example |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public frontend URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | Site URL for sitemap/metadata | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | NestJS backend URL | `http://localhost:3001` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID for frontend | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth Web Client ID for backend token verification | `xxx.apps.googleusercontent.com` |

`NEXT_PUBLIC_API_URL` must match the backend `PORT`. Default backend runs on `3001`, frontend on `3000`.

## Backend `.env`

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=chat
DB_SSL=false
DB_BOOTSTRAP_SCHEMA=false
PERFORMANCE_INDEXES=true
ANALYTICS_SALT=change-me-local-analytics-salt

AUTH_TOKEN_SECRET=change-me-local-auth-token-secret
ACCESS_TOKEN_SECRET=change-me-local-access-token-secret
REFRESH_TOKEN_SECRET=change-me-local-refresh-token-secret

GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456
```

If using a PostgreSQL connection string, the `DB_*` group can be replaced with:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chat
```

## Frontend `.env`

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
NEXT_DIST_DIR=.next
```

## Security Notes

- Production must change all secrets: `AUTH_TOKEN_SECRET`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ANALYTICS_SALT`.
- `ADMIN_PASSWORD` must not use the default password when deploying.
- `CORS_ORIGINS` should only declare actual frontend domains, not `*`.
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser; do not put secrets in this group.
