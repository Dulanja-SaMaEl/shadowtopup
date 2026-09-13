# ShadowTopUp — Production Deployment Guide

This guide covers deploying **ShadowTopUp** to **Vercel** and configuring **Supabase**.

---

## 1. Quick Deploy on Vercel

### Step 1: Push Code to GitHub
Ensure your repository is pushed to GitHub (`main` branch):
```bash
git push origin main
```

### Step 2: Import Project into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** → **Project**.
3. Select your repository: `Dulanja-SaMaEl/shadowtopup`.
4. Set **Root Directory** to `frontend`.
5. Framework Preset will be automatically detected as **Next.js**.

### Step 3: Configure Environment Variables
In the Vercel project settings, add the following environment variables:

| Variable | Description | Example / Default |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | `https://your-id.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Anon Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secret Service Role Key | `eyJhbGciOi...` |
| `UC_BOT_EMAIL` | Registered UCBot account email | `admin@shadowtopup.com` |
| `UC_BOT_API_KEY` | UCBot API Token (UUID format) | `a29b37d3-...` |
| `GARENA_SHELL_AUTOCODE` | Garena Authenticator secret key | `5ZEEJ3VDKEXSSD6J` |
| `EZCASH_API_TOKEN` | Dialog eZ Cash verification token | `a29b37d3-...` |
| `NEXT_PUBLIC_EZCASH_NUMBER` | Dialog eZ Cash recipient number | `0765604635` |
| `NEXT_PUBLIC_EZCASH_NAME` | Dialog eZ Cash recipient name | `Shadow Store` |
| `HL_GAMING_USERUID` | HL Gaming Account User UID | `Xv00AKjlBJ...` |
| `HL_GAMING_API_KEY` | HL Gaming API Key (or rotation pool) | `Kjt47EN5...` |
| `NEXT_PUBLIC_APP_URL` | Production Domain | `https://shadowtopup.com` |

### Step 4: Click Deploy
Vercel will build and deploy the application worldwide on its Edge network.

---

## 2. Supabase Database Setup

If configuring a new Supabase project:
1. Open the **SQL Editor** in your [Supabase Dashboard](https://supabase.com/dashboard).
2. Execute the migration scripts in order from `supabase/migrations/`:
   - `001_core_schema.sql`
   - `002_shell_accounts.sql`
   - `003_pricing_rules_and_package_codes.sql`
   - `004_shadow_wallet_and_ezcash.sql`
3. Storage Buckets:
   - Create a public bucket named `package-images`.
   - Create a public bucket named `game-images`.

---

## 3. Optional: Backend Microservice on Render

If you wish to deploy the lightweight Express microservice on Render:
1. In Render Dashboard, click **New** → **Web Service**.
2. Select your repository and set **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add environment variables:
   - `PORT`: `5000`
   - `SCRAPER_SECRET_KEY`: `your_secure_key`
   - `ALLOWED_ORIGINS`: `https://shadowtopup.com`
