# SePay Integration - Issues Encountered and Fixes

## 1. Google Login 404 - Backend calls wrong port

**Symptom:** `POST /api/v1/auth/google-login` → 404

**Cause:** Frontend route handler fetches to `http://localhost:3000` (Next.js itself) instead of backend port 3001.

**Fix:**
- `google-login/route.ts`: use `BACKEND_URL` from `@/lib/env` (defaults to `http://localhost:3001`)
- `Frontend/.env.example`: change `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` from 3001 → 3000

---

## 2. Login Failure - Missing GOOGLE_CLIENT_ID

**Symptom:** Backend reports `"Missing GOOGLE_CLIENT_ID configuration"`

**Cause:** `backend/.env` does not exist, `load-env.ts` cannot read the file.

**Fix:** Copy `.env.example` → `.env`, update `GOOGLE_CLIENT_ID` to match frontend.

---

## 3. Admin Login 405 - DemoAuthGuard blocks

**Symptom:** `POST /api/v1/manager/login` → 405

**Cause:** `DemoAuthGuard` requires session before login.

**Fix:** `demo-auth.guard.ts` — add bypass for `/api/v1/manager/login` and `/api/v1/auth/`.

---

## 4. CORS Wrong Port - Backend rejects request

**Symptom:** Request blocked because origin is invalid.

**Cause:** `backend/.env` has `FRONTEND_URL=http://localhost:3001` (wrong, should be 3000).

**Fix:** Change `CORS_ORIGINS`, `FRONTEND_URL`, `NEXT_PUBLIC_APP_URL` to `http://localhost:3000`.

---

## 5. QR Not Displaying - Wrong bankCode

**Symptom:** API returns QR URL with `SBSEPAYWUEHCLOJ5W7G` (merchant ID) instead of `OCB`.

**Cause:** `bankCode` prioritizes reading `SEPAY_MERCHANT_ID` before `PAY_BANK_ID`.

**Fix:** `seppay.service.ts` — change order: `PAY_BANK_ID` → `'OCB'`.

---

## 6. SePay API 403 - Checkout cannot create order

**Symptom:** Log `"SePay API unavailable, using local QR (API error: 403)"`

**Cause:** `SEPAY_API_TOKEN` or `SEPAY_MERCHANT_ID` does not have correct permissions for checkout endpoint.

**Fix:** Use local QR fallback. Does not affect main flow.

---

## 7. Webhook 0ms - No processing

**Symptom:** `POST /api/v1/payment/sepay/ipn 0ms` — nothing saved to DB.

**Cause:** SePay webhook sends body in different format:
- No `status` field → rejected at `txStatus !== 'completed'` check
- Field `referenceCode` instead of `transactionCode`
- Field `transferAmount` instead of `amount_in`
- Field `content` instead of `transaction_content`

**Fix (`seppay.controller.ts`):**
- Remove `txStatus` check
- Read `referenceCode`, `transferAmount`, `content` from body

---

## 8. Webhook DB Write Fails - FK Constraint

**Symptom:** Webhook reaches handler but no user to assign.

**Cause:** `recordDeposit` uses `userId: null` → FK fails.

**Fix (`seppay.service.ts`):**
- `recordDeposit`: search `paymentStore` to match transfer content with user waiting for payment
- If match found → write to DB + auto-activate VIP
- If not → skip with log

---

## 9. VIP Not Auto-Activated

**Symptom:** Deposit completed but VIP not activated.

**Cause:** `confirmPayment` writes to DB but does not call `subscribeUser`.

**Fix (`seppay.service.ts`):**
- `confirmPayment`: after DB write, call `subscriptionService.subscribeUser` if `planId` exists
- `recordDeposit`: also call `subscribeUser` if pending payment found

---

## Correct Operation Flow

```
User logs in → VIP → Buy package
  → App creates payment in paymentStore (content: "SEPDA96945 SEPF97B06")
  → Displays QR with that content
  → User transfers money

SePay sends webhook:
  { referenceCode: "FT...", transferAmount: 10000, content: "... SEPDA96945 SEP421FF7" }

Backend receives webhook:
  → confirmByTransactionCode: search paymentStore by content
  → Matches user ID
  → Writes to payments table
  → subscribeUser → VIP activated
```

## Files Modified

| File | Fix |
|------|-----|
| `Frontend/app/api/v1/auth/google-login/route.ts` | BACKEND_URL, .catch json |
| `Frontend/next.config.ts` | REFERRER_POLICY env |
| `Frontend/middleware.ts` | Add /vip to matcher |
| `Frontend/.env.example` | Port 3001 → 3000 |
| `Frontend/.env` | Created from .env.example |
| `backend/src/security/security.config.ts` | REFERRER_POLICY env |
| `backend/src/auth/guards/demo-auth.guard.ts` | Bypass login + sepay routes |
| `backend/src/seppay/seppay.controller.ts` | Remove HMAC, fix field names |
| `backend/src/seppay/seppay.service.ts` | Match content, auto VIP |
| `backend/src/payment/admin-payment.controller.ts` | Add create endpoint |
| `backend/.env.example` | Real GOOGLE_CLIENT_ID, REFERRER_POLICY |
| `backend/.env` | Created from .env.example |
| `backend/scripts/reconcile-sepay.mjs` | Manual sync script |
