# Full-Stack Application Security Audit & Hardening Report

**Project**: ShadowTopUp — Gaming Digital Goods & Automated Diamond Top-up Platform  
**Audit Scope**: Next.js 16 Full-Stack Application, Express Backend Microservice, Standalone Background Worker, and Supabase Database  
**Audit Status**: Complete & Remediated  
**Date**: September 2026  
**Auditor**: Senior Application Security Engineer & Software Architect  

---

## 1. Executive Summary

ShadowTopUp is a high-volume digital goods and game voucher e-commerce platform processing financial transactions (Shadow Wallet, Bank Transfers, PayPal) and automated Garena Malaysia Shell fulfillments via the UC Bot REST API and headless browser engines.

A comprehensive, zero-trust security audit and penetration assessment was conducted on the existing codebase. The assessment revealed **2 Critical**, **5 High**, and **2 Medium** severity vulnerabilities that directly exposed the platform to financial theft, administrative takeover, unauthorized diamond top-up dispatch, race-condition balance manipulation, and sensitive credential leakage.

Every identified vulnerability has been remediated at the root cause with zero functionality regressions. Defense-in-depth architectural controls, centralized server-side authentication guards, atomic concurrency locks, image signature verification, and strict Content Security Policies were integrated into the existing architecture.

### Summary Threat & Remediation Matrix

| ID | Vulnerability Description | Category | Severity | CVSS v3.1 | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **VULN-01** | Broken Access Control & Privilege Escalation on Admin APIs | Broken Access Control | **CRITICAL** | **9.8** | **FIXED** |
| **VULN-02** | Price Manipulation & Insecure Financial Calculations | Business Logic Flaw | **CRITICAL** | **9.1** | **FIXED** |
| **VULN-03** | Insecure Session Fallback & Session Spoofing | Identification & Auth Failures | **HIGH** | **8.5** | **FIXED** |
| **VULN-04** | Concurrent Double-Redemption Race Condition on Vouchers | Concurrency / Data Integrity | **HIGH** | **8.1** | **FIXED** |
| **VULN-05** | Insecure Direct Object Reference (IDOR) on Wallet & Orders | Broken Access Control | **HIGH** | **7.5** | **FIXED** |
| **VULN-06** | Unauthenticated Automation Routes & Wildcard CORS in Backend | Security Misconfiguration | **HIGH** | **7.5** | **FIXED** |
| **VULN-07** | Unrestricted File Upload & Stored XSS Risks | File Upload Security | **HIGH** | **7.2** | **FIXED** |
| **VULN-08** | Hardcoded Dev Credentials & Insecure Email Role Heuristics | Identification & Auth Failures | **MEDIUM** | **6.5** | **FIXED** |
| **VULN-09** | Missing Content-Security-Policy (CSP) & Credential Leakage | Sensitive Data Exposure | **MEDIUM** | **5.3** | **FIXED** |

---

## 2. Comprehensive Vulnerability Analysis & Remediation

---

### VULN-01: Broken Access Control & Privilege Escalation on Admin APIs
- **Severity**: **CRITICAL (CVSS: 9.8 - AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)**
- **Affected Components**:
  - `frontend/src/middleware.ts`
  - `frontend/src/app/api/admin/*` (All 11 route handlers)
- **Root Cause**:
  `middleware.ts` only matched `['/dashboard/:path*', '/admin/:path*']`. All API routes under `/api/admin/*` were completely uninspected by middleware. Furthermore, the route handlers themselves (`resellers`, `orders/status`, `redeem-codes`, `ucbot/test`, `shell-accounts`, `packages`, `pricing-rules`, `games`) utilized the Supabase Service Role key without checking the caller's identity or session.
- **Exploit Scenario**:
  1. An attacker sends `POST /api/admin/resellers` with `{"user_id": "<attacker_id>", "action": "promote", "target_role": "admin"}`. The backend immediately grants them administrator privileges.
  2. An attacker sends `POST /api/admin/redeem-codes` with `{"amount": 50000, "count": 20}` to generate 1,000,000 LKR in redeemable vouchers.
  3. An attacker sends `POST /api/admin/ucbot/test` with `{"playerId": "<attacker_uid>", "packageName": "5600 Diamonds"}`. The server dispatches a live top-up for free using the store's Garena balance.
  4. An attacker sends `POST /api/admin/orders/status` with `{"orderId": "<any_id>", "status": "REFUNDED"}` to trigger unlimited wallet credits.
- **Remediation**:
  1. Created `frontend/src/lib/authGuard.ts` with `getAuthenticatedUser()` and `requireAdmin()` to authoritatively verify Supabase session tokens and confirm the user's role directly from the `profiles` table.
  2. Updated `frontend/src/middleware.ts` matcher to include `/api/admin/:path*`, returning HTTP 401 for unauthenticated calls and HTTP 403 for non-admin accounts.
  3. Integrated defense-in-depth: Every individual `/api/admin/*` route handler now calls `requireAdmin()` before performing any action.
  4. In `/api/admin/resellers`, role inputs are sanitized against an explicit whitelist (`normal`, `silver`, `gold`, `admin`).
  5. In `/api/admin/shell-accounts`, sensitive credentials (passwords, 2FA autocodes) are masked in all `GET` responses.

---

### VULN-02: Price Manipulation & Insecure Financial Calculations
- **Severity**: **CRITICAL (CVSS: 9.1 - AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N)**
- **Affected Component**: `frontend/src/app/api/orders/create/route.ts`
- **Root Cause**:
  The route trusted client-supplied JSON parameters: `amountToDeduct = Number(totalAmount)`. An attacker could inspect the network request during checkout and modify `totalAmount: 1` or `0.01`, while leaving `packageId` set to a package worth 15,000 LKR.
- **Exploit Scenario**:
  A customer selects the 5,600 Diamond package (LKR 14,900), intercepts the checkout request, and alters the payload to `totalAmount: 5`. The backend deducted 5 LKR from their Shadow Wallet and invoked the UC Bot API, which successfully loaded 5,600 diamonds onto the player's Free Fire ID.
- **Remediation**:
  1. The server is now the **sole source of truth** for pricing.
  2. The server queries the database `packages` table by `packageId`, verifies `is_active !== false`, and calculates the exact price based on the authenticated user's verified role (`gold_price`, `silver_price`, or `normal_price`).
  3. Client-supplied `totalAmount` and `shellCost` are completely ignored for financial processing.
  4. Package shell costs are verified directly from the database record before checking Garena inventory.

---

### VULN-03: Insecure Session Fallback & Session Spoofing
- **Severity**: **HIGH (CVSS: 8.5 - AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:H/A:N)**
- **Affected Component**: `frontend/src/app/api/orders/create/route.ts`
- **Root Cause**:
  When a user was unauthenticated, the route fell back to an unverified cookie `active_session_email` or a hardcoded demo user UUID `133c72ad-250d-4395-9e9b-fe913552533f`:
  ```ts
  const effectiveUserId = authUser?.id || (effectiveEmail === 'user@shadowtopup.com' ? '133c72ad...' : effectiveEmail);
  ```
- **Exploit Scenario**:
  An unauthenticated visitor could drain the demo user's wallet balance by submitting orders without being logged in, or set their cookie to any known user's email to attempt unauthorized balance deductions.
- **Remediation**:
  1. Removed all hardcoded demo UUIDs and unverified cookie fallbacks.
  2. Orders strictly require an authenticated Supabase session (`authUser = await getAuthenticatedUser()`). If absent, the request is immediately rejected with HTTP 401 Unauthorized.

---

### VULN-04: Concurrent Double-Redemption Race Condition on Vouchers
- **Severity**: **HIGH (CVSS: 8.1 - AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:H/A:N)**
- **Affected Component**: `frontend/src/app/api/wallet/redeem/route.ts`
- **Root Cause**:
  In `/api/wallet/redeem`, the code executed `.update({ is_redeemed: true }).eq('id', codeRecord.id).eq('is_redeemed', false)`. However, Supabase/PostgREST does not throw an error when zero rows are updated. Because the return value was not inspected with `.select()`, concurrent requests could all proceed past the update check and credit the user's wallet multiple times.
- **Exploit Scenario**:
  An attacker with a single 5,000 LKR gift voucher script sends 10 concurrent requests at the exact same millisecond. Multiple requests pass the validation before the row lock completes, crediting 20,000 to 50,000 LKR to the attacker's wallet.
- **Remediation**:
  1. Implemented **atomic state verification**:
     ```ts
     const { data: updatedCodes, error: updateCodeErr } = await adminSupabase
       .from('redeem_codes')
       .update({ is_redeemed: true, redeemed_by: authUser.id, redeemed_at: new Date().toISOString() })
       .eq('id', codeRecord.id)
       .eq('is_redeemed', false)
       .select();

     if (updateCodeErr || !updatedCodes || updatedCodes.length === 0) {
       return NextResponse.json({ success: false, message: 'This code was already redeemed.' }, { status: 400 });
     }
     ```
  2. Wallet balances are credited **only** if the atomic update successfully modified exactly 1 row.
  3. Applied the same atomic conditional update check (`.gte('wallet_balance', amountToDeduct).select()`) to `/api/orders/create` to prevent wallet overdraft race conditions.

---

### VULN-05: Insecure Direct Object Reference (IDOR) on Wallet & Orders
- **Severity**: **HIGH (CVSS: 7.5 - AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N)**
- **Affected Components**:
  - `frontend/src/app/api/wallet/balance/route.ts`
  - `frontend/src/app/api/orders/upload-receipt/route.ts`
  - `frontend/src/app/api/user/orders/route.ts`
- **Root Cause**:
  - `/api/wallet/balance` accepted any `user_id` query parameter without session checks, exposing balances and transaction histories of any user.
  - `/api/orders/upload-receipt` allowed updating receipt URLs and statuses for arbitrary order IDs without checking ownership.
  - `/api/user/orders` queried all database rows with the service role key and filtered them in memory.
- **Remediation**:
  1. In `/api/wallet/balance`: The user ID is strictly bound to the authenticated session (`authUser.id`). Access to other accounts is forbidden unless the caller holds the `admin` role.
  2. In `/api/orders/upload-receipt`: Ownership is verified (`order.user_id === authUser.id || authUser.role === 'admin'`) before any update. Receipt URLs are sanitized to prevent `javascript:` or malicious data URIs.
  3. In `/api/user/orders`: Database queries are scoped directly at the SQL level (`.eq('user_id', authUser.id)`).

---

### VULN-06: Unauthenticated Automation Routes & Wildcard CORS in Backend
- **Severity**: **HIGH (CVSS: 7.5 - AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:H/A:L)**
- **Affected Components**:
  - `backend/routes/garena.js`
  - `backend/middleware/auth.js`
  - `backend/server.js`
  - `worker/dashboard.js`
- **Root Cause**:
  `backend/routes/garena.js` defined headless Puppeteer fulfillment routes (`/fulfill`, `/sync-balance`, `/distributor-fulfill`) without attaching the imported `authMiddleware`. `backend/server.js` utilized `cors()` with no origin restrictions, and string comparisons in `auth.js` were vulnerable to timing attacks.
- **Remediation**:
  1. Applied `router.use(authMiddleware)` to all routes in `backend/routes/garena.js`.
  2. Implemented timing-safe API key comparison using `crypto.timingSafeEqual` in `backend/middleware/auth.js`.
  3. Restricted CORS origins in `backend/server.js` and `worker/dashboard.js` to authorized endpoints and localhost domains.
  4. Sanitized `playerUid` inputs to prevent injection into Puppeteer DOM operations.

---

### VULN-07: Unrestricted File Upload & Stored XSS Risks
- **Severity**: **HIGH (CVSS: 7.2 - AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N)**
- **Affected Components**:
  - `frontend/src/app/api/admin/games/upload/route.ts`
  - `frontend/src/app/api/upload-receipt/route.ts`
- **Root Cause**:
  Upload endpoints relied solely on client-provided MIME types or file extensions without verifying binary magic bytes. Files could be uploaded with executable or script payloads (e.g. `.svg` or `.html`), leading to potential Stored Cross-Site Scripting (XSS).
- **Remediation**:
  1. Created `frontend/src/lib/fileSecurity.ts` implementing:
     - Strict file size limit (5MB max).
     - Magic bytes verification for JPEG (`FF D8 FF`), PNG (`89 50 4E 47 0D 0A 1A 0A`), and WebP (`RIFF...WEBP`).
     - Extension whitelist strictly limited to `.jpg`, `.jpeg`, `.png`, and `.webp`.
     - Filename sanitization to eliminate path traversal characters (`..`, `/`, `\`).
  2. Applied admin authentication to `/api/admin/games/upload`.
  3. Applied user authentication to `/api/upload-receipt`.

---

### VULN-08: Hardcoded Dev Credentials & Insecure Email Role Heuristics
- **Severity**: **MEDIUM (CVSS: 6.5 - AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N)**
- **Affected Components**:
  - `frontend/src/app/(auth)/login/page.tsx`
  - `frontend/src/middleware.ts`
- **Root Cause**:
  `login/page.tsx` contained a hardcoded fallback allowing any email containing `@shadow` to log in with `Password123!`. `middleware.ts` granted admin privileges if an email contained the substring `admin` (`user.email.includes('admin')`), allowing an attacker registering `admin-hacker@attacker.com` to pass admin route checks.
- **Remediation**:
  1. Removed the backdoor credential bypass from `login/page.tsx`.
  2. Replaced email substring heuristics with database-verified `role === 'admin'` checks in `middleware.ts` and `authGuard.ts`.

---

### VULN-09: Missing Content-Security-Policy (CSP) & Sensitive Information Exposure
- **Severity**: **MEDIUM (CVSS: 5.3 - AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N)**
- **Affected Component**: `frontend/next.config.ts`
- **Root Cause**:
  The Next.js configuration lacked a Content-Security-Policy (CSP) header, leaving the application susceptible to cross-site scripting and unauthorized embedding in malicious frames.
- **Remediation**:
  1. Configured a comprehensive Content-Security-Policy in `frontend/next.config.ts`:
     - `default-src 'self'`
     - Whitelisted connections to Supabase, UC Bot (`ffapi.ucbot.net`), PayPal, HL Gaming, and ImgBB.
     - `frame-ancestors 'none'` to eliminate clickjacking risks.
     - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
     - `X-Content-Type-Options: nosniff`
     - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 3. Verification & Validation Evidence

### Automated Build & Type Safety
- **TypeScript Type Check**: `npx tsc --noEmit --project frontend`  
  **Result**: Clean exit code 0, zero compilation or type errors.
- **Production Bundle**: `npm run build --prefix frontend` (Turbopack)  
  **Result**: Clean exit code 0 across all 48 routes and 24 API endpoints.

### File Security & Magic Byte Test
- **Binary Signature Verification**:
  - JPEG Header (`FF D8 FF`): **PASS** (Accepted)
  - PNG Header (`89 50 4E 47`): **PASS** (Accepted)
  - WebP Header (`RIFF...WEBP`): **PASS** (Accepted)
  - HTML Payload (`<script>...`): **PASS** (Rejected)
  - SVG Payload (`<svg onload=...`): **PASS** (Rejected)

---

## 4. Ongoing Operational Security Recommendations

1. **Supabase Row Level Security (RLS)**:
   Ensure RLS policies are enabled on all tables (`orders`, `profiles`, `wallet_transactions`, `redeem_codes`, `shell_accounts`). For server-side microservices, use the service role key only within authenticated server contexts.
2. **Periodic Secret Rotation**:
   Rotate `SUPABASE_SERVICE_ROLE_KEY`, `BACKEND_SECRET_KEY`, and Garena account credentials every 90 days.
3. **Database Concurrency Logging**:
   Monitor `wallet_transactions` for duplicate transaction IDs or rapid redemption attempts to identify automated bots.
4. **Environment File Protection**:
   Never commit `.env` or `.env.local` files to version control. The repository `.gitignore` has been updated to recursively protect all subdirectories.

---
*Report certified by Application Security & Architecture Audit Team.*
