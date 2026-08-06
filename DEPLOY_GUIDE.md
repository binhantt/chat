# Deployment Guide — Chat App

## Architecture Overview

```
User ── HTTP/80 ──► Nginx ──┬─► /api/* ───────► Backend (NestJS) :3001
                             │                    │
                             │                    ├─► PostgreSQL (Supabase)
                             │                    │
                             │                    └─► WebSocket :3001
                             │
                             └─► /* ───────────► Frontend (Next.js) :3000
```

- **Server**: Linux VPS — `103.77.243.58`
- **Backend**: NestJS 11, TypeORM, PostgreSQL (Supabase)
- **Frontend**: Next.js 16 (App Router), Radix UI, Zustand, Tailwind CSS
- **Reverse Proxy**: Nginx (port 80)
- **Process Manager**: PM2
- **Database**: Supabase PostgreSQL (serverless connection pool)

---

## 1. Server Requirements

### Software

| Tool | Minimum Version | Purpose |
|------|-----------------|---------|
| Node.js | 20.x | Run backend & frontend |
| pnpm | 9.x | Package manager |
| Nginx | 1.24+ | Reverse proxy |
| PM2 | 5.x | Process manager |
| PostgreSQL (client) | 16.x | Migration script (optional) |

### Check After SSH Into Server

```bash
node -v
pnpm -v
nginx -v
pm2 -v
```

If missing, install:

```bash
# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# pnpm
corepack enable && corepack prepare pnpm@latest --activate
# or: npm install -g pnpm

# Nginx
sudo apt-get install -y nginx

# PM2
npm install -g pm2
```

---

## 2. Directory Structure on Server

```
/home/chat/
├── deploy/
│   ├── setup.sh                    # Backend deploy script
│   ├── ecosystem.config.js         # PM2 config
│   ├── nginx.conf                  # Nginx config (reference)
│   ├── backend.env.production      # Backend production env
│   ├── frontend.env.production     # Frontend production env
│   └── generate-secrets.js         # Random secret generator tool
├── backend/
│   ├── .env                        # Copy from backend.env.production
│   ├── package.json
│   ├── build/                      # After build
│   └── src/
├── Frontend/
│   ├── .env                        # Copy from frontend.env.production
│   ├── package.json
│   ├── .next/                      # After build
│   └── app/
└── logs/
    ├── backend-out.log
    └── backend-error.log
```

---

## 3. Environment Setup

### 3.1 Backend Environment Variables

File: `deploy/backend.env.production` → copy as `backend/.env`

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://103.77.243.58:3000
NEXT_PUBLIC_APP_URL=http://103.77.243.58:3000
CORS_ORIGINS=http://103.77.243.58:3000
REFERRER_POLICY=strict-origin-when-cross-origin

# Supabase
SUPABASE_URL=https://burlcmfytgbwiyorokrg.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_JWKS_URL=https://burlcmfytgbwiyorokrg.supabase.co/auth/v1/.well-known/jwks.json

# Database
DATABASE_URL=postgresql://postgres.burlcmfytgbwiyorokrg:...@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DB_SSL=true
DB_SYNCHRONIZE=false
DB_BOOTSTRAP_SCHEMA=true
PERFORMANCE_INDEXES=true

# Security (replace with auto-generated secrets for real deployment)
AUTH_TOKEN_SECRET=<generate-secrets>
ACCESS_TOKEN_SECRET=<generate-secrets>
REFRESH_TOKEN_SECRET=<generate-secrets>
ANALYTICS_SALT=<generate-secrets>

# Google OAuth
GOOGLE_CLIENT_ID=273697303002-...apps.googleusercontent.com

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<generate-secrets>

# SePay (payment)
SEPAY_MERCHANT_ID=
SEPAY_API_TOKEN=
...
```

> **Important:** Before real production deployment, run `node deploy/generate-secrets.js` to generate new secrets. Do not use sample secrets.

### 3.2 Frontend Environment Variables

File: `deploy/frontend.env.production` → copy as `Frontend/.env`

```env
NEXT_PUBLIC_APP_URL=http://103.77.243.58
NEXT_PUBLIC_SITE_URL=http://103.77.243.58
NEXT_PUBLIC_API_URL=http://103.77.243.58:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=273697303002-...apps.googleusercontent.com
NEXT_DIST_DIR=.next
```

---

## 4. Deploy Backend

### 4.1 Automatic Script

```bash
cd /home/chat
bash deploy/setup.sh
```

The script will perform:
1. Create `logs/` directory
2. Copy `backend.env.production` → `backend/.env`
3. `cd backend && pnpm install --frozen-lockfile`
4. `pnpm run build` (output to `build/`)
5. `pnpm run migrate` (run `migration.sql` via Supabase)
6. Install PM2 + start backend

### 4.2 Or Perform Manually

```bash
# Step 1: Upload code to server (if not already there)
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude 'build' ./ root@103.77.243.58:/home/chat/

# Step 2: Setup backend
mkdir -p /home/chat/logs
cp /home/chat/deploy/backend.env.production /home/chat/backend/.env

# Step 3: Install & build
cd /home/chat/backend
pnpm install --frozen-lockfile
pnpm run build

# Step 4: Migration
pnpm run migrate

# Step 5: Start with PM2
cd /home/chat
pm2 start deploy/ecosystem.config.js --env production
pm2 save
pm2 startup   # auto-restart on server reboot
```

### 4.3 Verify Backend

```bash
curl http://localhost:3001/api
# Expected: JSON response (may be 404 if no root route, that's normal)

pm2 logs chat-backend --lines 20
```

---

## 5. Deploy Frontend

### 5.1 Manual Script (no automatic script for frontend yet)

```bash
# Copy env
cp /home/chat/deploy/frontend.env.production /home/chat/Frontend/.env

# Install & build
cd /home/chat/Frontend
pnpm install --frozen-lockfile
pnpm run build

# Start with PM2
pm2 start "node node_modules/next/dist/bin/next start -p 3000" \
  --name chat-frontend \
  --cwd /home/chat/Frontend \
  --env NODE_ENV=production

pm2 save
```

> **Note:** If using `npm` instead of `pnpm` for Frontend (currently Frontend uses `package-lock.json`), use `npm ci --only=production && npm run build`.

---

## 6. Nginx Configuration

### 6.1 Copy Config

```bash
sudo cp /home/chat/deploy/nginx.conf /etc/nginx/sites-available/chat
sudo ln -s /etc/nginx/sites-available/chat /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 6.2 Nginx Config Explanation

File: `deploy/nginx.conf`

| Location | Proxies To | Purpose |
|----------|------------|---------|
| `/api/` | `127.0.0.1:3001` | Backend REST + SSE |
| `/socket.io/` | `127.0.0.1:3001` | WebSocket (24h timeout) |
| `/` | `127.0.0.1:3000` | Frontend Next.js |

Important settings:
- `proxy_buffering off` — disable buffering for SSE (Server-Sent Events)
- `proxy_read_timeout 86400s` — keep WebSocket alive for 24h
- WebSocket headers (`Upgrade`, `Connection`) for `/socket.io/`

### 6.3 If You Have a Domain and HTTPS

When you have a real domain, add SSL configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name chat.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/chat.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chat.yourdomain.com/privkey.pem;

    # Same location blocks as the HTTP config above
    ...
}

server {
    listen 80;
    server_name chat.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

Install HTTPS with Let's Encrypt:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d chat.yourdomain.com
```

---

## 7. PM2 Management

### 7.1 Common Commands

```bash
pm2 status                  # View status
pm2 logs chat-backend       # View backend logs
pm2 logs chat-frontend      # View frontend logs
pm2 monit                   # Live monitor (CPU, memory)
pm2 restart chat-backend    # Restart backend
pm2 restart chat-frontend   # Restart frontend
pm2 stop chat-backend       # Stop backend
pm2 delete chat-backend     # Remove from PM2
pm2 save                    # Save process list
pm2 startup                 # Auto-start on reboot
```

### 7.2 Backend PM2 Configuration (Current)

File: `deploy/ecosystem.config.js`

| Parameter | Value | Notes |
|-----------|-------|-------|
| instances | 1 | Fork mode |
| max_memory_restart | 500M | Restart if over 500MB |
| restart_delay | 3000ms | Wait 3s before restart |
| max_restarts | 10 | Maximum 10 restarts |
| error_file | `/root/chat/logs/backend-error.log` | |
| out_file | `/root/chat/logs/backend-out.log` | |

> **Note:** `ecosystem.config.js` currently uses absolute path `/root/chat/...`. If the project directory is `/home/chat/...`, update accordingly.

### 7.3 Frontend PM2 (Suggestion)

To add frontend to the ecosystem:

```javascript
// Add to the apps array in ecosystem.config.js
{
  name: 'chat-frontend',
  cwd: '/root/chat/Frontend',
  script: 'node_modules/next/dist/bin/next',
  args: 'start -p 3000',
  env: {
    NODE_ENV: 'production',
  },
  instances: 1,
  exec_mode: 'fork',
  max_memory_restart: '500M',
  restart_delay: 3000,
  max_restarts: 10,
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  error_file: '/root/chat/logs/frontend-error.log',
  out_file: '/root/chat/logs/frontend-out.log',
  merge_logs: true,
}
```

---

## 8. Database (Supabase PostgreSQL)

### 8.1 Connection Info

- **Supabase Project**: `burlcmfytgbwiyorokrg`
- **Database URL**: `postgresql://postgres.burlcmfytgbwiyorokrg:<password>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- **SSL**: `rejectUnauthorized: false` (Supabase pooler)

### 8.2 Migration

Migration file: `migration.sql` (contains the full schema: enum types, tables, indexes)

Run migration:
```bash
cd /home/chat/backend
pnpm run migrate
```

This uses `scripts/migrate-supabase.ts` — connects directly via DATABASE_URL, reads the `migration.sql` file, and executes it.

### 8.3 Performance Indexes

When the backend starts with `PERFORMANCE_INDEXES=true`, it automatically creates composite indexes:

- `messages(room_id, created_at DESC)`
- `messages(user_id, created_at DESC)`
- `conversations(status, updated_at, id)`
- `reports(status, created_at, id)`
- `users(created_at, id)`

---

## 9. Security — Production Checklist

Before going to production, verify the following:

### 9.1 Environment

- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` points to the correct production domain
- [ ] `CORS_ORIGINS` only includes valid domains (not `*`)
- [ ] `REFERRER_POLICY=strict-origin-when-cross-origin`
- [ ] Regenerate all secrets:
  ```bash
  node deploy/generate-secrets.js
  # Overwrite: AUTH_TOKEN_SECRET, ACCESS_TOKEN_SECRET,
  # REFRESH_TOKEN_SECRET, ANALYTICS_SALT, ADMIN_PASSWORD
  ```
- [ ] `DB_SYNCHRONIZE=false` (disable auto-sync in production)

### 9.2 Cookie & Auth

- [ ] Cookie has `secure=true` (auto-enabled when `NODE_ENV=production`)
- [ ] Cookie `sameSite=strict`
- [ ] Cookie `HttpOnly` for access_token and refresh_token
- [ ] CSRF works (x-csrf-token header)
- [ ] No tokens stored in localStorage

### 9.3 HTTPS & Headers

- [ ] HTTPS configured (Nginx + Let's Encrypt)
- [ ] Security headers active:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security` (production)
  - `Content-Security-Policy`
  - `Cross-Origin-Opener-Policy: same-origin`

### 9.4 API Security

- [ ] Manager routes check backend permissions
- [ ] Input sanitization active (InputSanitizationPipe)
- [ ] Content, title, bio length limits enforced
- [ ] Pagination has maximum `limit`
- [ ] No `SELECT *`
- [ ] Messages validated through conduct rules

### 9.5 Other

- [ ] Backend build passes: `pnpm run build`
- [ ] Frontend build passes: `pnpm run build`
- [ ] Database indexes created
- [ ] Logs do not contain secrets, tokens, or passwords
- [ ] Admin password changed from default

---

## 10. Monitoring & Troubleshooting

### 10.1 Check Status

```bash
# Is backend running?
pm2 status

# Does backend respond?
curl -v http://localhost:3001/api

# Does frontend respond?
curl -v http://localhost:3000

# Is Nginx working?
curl -v http://103.77.243.58

# Error logs
pm2 logs chat-backend --lines 50
tail -f /home/chat/logs/backend-error.log
```

### 10.2 Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `ERR_CONNECTION_REFUSED` | Backend not running | `pm2 start chat-backend`, check port 3001 |
| `CSRF token invalid` | Missing `x-csrf-token` header | Frontend must send CSRF token from cookie |
| `CORS error` | Origin not in allowed list | Check `CORS_ORIGINS` and `FRONTEND_URL` |
| WebSocket not connecting | Missing proxy headers | Check `Upgrade` / `Connection` headers in Nginx |
| `Cannot find module` | Missing node_modules | `cd backend && pnpm install` |
| Migration failed | Wrong DATABASE_URL | Check Supabase connection string |
| 502 Bad Gateway | Nginx cannot reach app | `pm2 status`, check backend/frontend port |

### 10.3 Restart Entire System

```bash
# Restart everything
pm2 restart all
sudo systemctl reload nginx

# Hard reset
pm2 delete all
pm2 start deploy/ecosystem.config.js --env production
pm2 start "next start -p 3000" --name chat-frontend --cwd /home/chat/Frontend
pm2 save
```

---

## 11. Update Application

```bash
# Step 1: Pull latest code from git
cd /home/chat
git pull origin main

# Step 2: Update backend
cd backend
pnpm install --frozen-lockfile
pnpm run build
pnpm run migrate          # if there are new migrations
pm2 restart chat-backend

# Step 3: Update frontend
cd /home/chat/Frontend
pnpm install --frozen-lockfile
pnpm run build
pm2 restart chat-frontend

# Step 4: Verify
pm2 status
curl -v http://localhost:3001/api
curl -v http://localhost:3000
```

---

## 12. Reference Files

| File | Purpose |
|------|---------|
| `deploy/setup.sh` | Automatic backend deploy script |
| `deploy/ecosystem.config.js` | PM2 ecosystem (backend) |
| `deploy/nginx.conf` | Nginx reverse proxy configuration |
| `deploy/backend.env.production` | Backend env for production |
| `deploy/frontend.env.production` | Frontend env for production |
| `deploy/generate-secrets.js` | Random secret generator tool |
| `backend/src/main.ts` | Backend entry point |
| `backend/src/load-env.ts` | Load .env file |
| `backend/src/security/security.config.ts` | CORS, CSRF, security headers |
| `backend/src/database/postgres.config.ts` | Database connection config |
| `backend/scripts/migrate-supabase.ts` | Migration script |
| `migration.sql` | Full database schema |
| `Frontend/middleware.ts` | Frontend middleware |
| `policy.yaml` | Security policy for ngrok |
| `DOC_06_BAO_MAT.md` | Security details |
| `DOC_07_ENV.md` | Environment variable details |

---

## 13. Notes

- **Current server**: `103.77.243.58` — backend is set up but not operational (ERR_CONNECTION_REFUSED).
- **Frontend not deployed yet**: Need to copy Frontend/ to server and run build.
- **Nginx not configured yet**: Need to copy `nginx.conf` to `/etc/nginx/sites-available/`.
- **No domain yet**: If you have a domain, update `FRONTEND_URL`, `NEXT_PUBLIC_APP_URL`, `CORS_ORIGINS` and add HTTPS.
- **Need to generate new secrets** before real production use.
