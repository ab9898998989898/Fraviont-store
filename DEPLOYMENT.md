# 🚀 FRAVIONT — Deployment Guide

> Target platform: **Vercel** + **Neon** (Postgres) + **Upstash** (Redis)

---

## Pre-Deploy Checklist

Before pushing to production, ALL of these must be green:

```
□ pnpm build               — zero errors
□ pnpm tsc --noEmit        — zero TypeScript errors
□ pnpm db:generate         — migrations are up to date
□ All .env.local values    — verified and non-empty
□ PayFast sandbox test     — full purchase flow complete
□ Admin login test         — role guard works
□ GSAP console audit       — zero trigger/tween warnings
□ Mobile test (375px)      — all pages render correctly
□ Lighthouse score         — Performance 90+, A11y 90+
```

---

## Step 1 — Neon Database (Production)

1. Go to [neon.tech](https://neon.tech) → Create project → Name: `fraviont-prod`
2. Create two branches:
   - `main` → production database
   - `dev` → local development (already used)
3. Copy the production connection string
4. Push schema to production:
   ```bash
   DATABASE_URL=postgresql://...prod-connection-string... pnpm db:push
   ```
5. Seed initial admin user (see DB_SEED.md)

---

## Step 2 — Upstash Redis (Production)

1. Go to [upstash.com](https://console.upstash.com) → Create database → Region: US-East-1
2. Enable: **TLS**, **Eviction: allkeys-lru**
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

---

## Step 3 — Vercel Project Setup

```bash
# Install Vercel CLI
pnpm add -g vercel

# Link project
vercel link

# Deploy preview
vercel

# Deploy production
vercel --prod
```

### Vercel Environment Variables (add ALL of these)

```
# Database
DATABASE_URL                    = (Neon production connection string)

# Auth
NEXTAUTH_SECRET                 = (run: openssl rand -base64 32)
NEXTAUTH_URL                    = https://fraviont.com

# AI
OPENROUTER_API_KEY              = sk-or-...

# Redis
UPSTASH_REDIS_REST_URL          = https://...upstash.io
UPSTASH_REDIS_REST_TOKEN        = ...

# Payments
PAYFAST_MERCHANT_ID             = ...
PAYFAST_MERCHANT_KEY            = ...
PAYFAST_PASSPHRASE              = ...
PAYFAST_SANDBOX                 = false   ← IMPORTANT: set to false for production

# Email
RESEND_API_KEY                  = re_...

# Auth Providers
AUTH_GOOGLE_ID                  = ...
AUTH_GOOGLE_SECRET              = ...

# App
NEXT_PUBLIC_SITE_URL            = https://fraviont.com

# Cron protection
CRON_SECRET                     = (run: openssl rand -hex 32)

# Storage (if using Vercel Blob)
BLOB_READ_WRITE_TOKEN           = ...
```

---

## Step 4 — Domain Setup

1. Vercel Dashboard → Your project → Settings → Domains
2. Add: `fraviont.com` and `www.fraviont.com`
3. Configure DNS at your registrar:
   ```
   A     @    76.76.19.61       (Vercel IP)
   CNAME www  cname.vercel-dns.com
   ```
4. Wait for SSL provisioning (usually < 5 minutes)

---

## Step 5 — PayFast Production Setup

1. Log in to [payfast.co.za](https://www.payfast.co.za) merchant account
2. Settings → Integration → Add your domain to allowed URLs:
   ```
   https://fraviont.com
   https://fraviont.com/api/payfast/itn
   https://fraviont.com/checkout/success
   https://fraviont.com/checkout/cancel
   ```
3. Set `PAYFAST_SANDBOX=false` in Vercel env vars
4. Test a real R1 transaction to confirm ITN fires correctly

---

## Step 6 — Google OAuth Setup

1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. OAuth 2.0 Client → Add authorized redirect URIs:
   ```
   https://fraviont.com/api/auth/callback/google
   ```
3. Copy Client ID + Secret → Vercel env vars

---

## Step 7 — Vercel Cron Jobs

Vercel reads `vercel.json` for cron config automatically. After deploy, verify in:
Vercel Dashboard → Your project → Settings → Cron Jobs

Jobs running:
```
Daily AI Digest    → 06:00 UTC daily    → /api/cron/daily-digest
Abandoned Cart     → Every 2 hours      → /api/cron/abandoned-cart
```

Test cron endpoints manually:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://fraviont.com/api/cron/daily-digest
```

---

## Step 8 — Post-Deploy Verification

```bash
# 1. Test store homepage loads
curl -I https://fraviont.com → 200 OK

# 2. Test admin redirect (should 302 to login)
curl -I https://fraviont.com/admin/dashboard → 302

# 3. Test PayFast ITN endpoint responds
curl -X POST https://fraviont.com/api/payfast/itn → should return 400 (no valid body)

# 4. Test tRPC health
curl https://fraviont.com/api/trpc/products.getAll?input={} → JSON response

# 5. Test Redis connection (check Upstash console for activity after browsing store)
```

---

## Rollback Procedure

If a deployment breaks production:
```bash
# List recent deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

---

## Monitoring

- **Errors:** Vercel → Functions tab → check for 500 errors
- **DB:** Neon dashboard → Monitoring tab → query performance
- **Redis:** Upstash console → Data Browser + Metrics
- **Payments:** PayFast merchant dashboard → Transactions

---

## Performance Targets

After deploy, run Lighthouse on:
- `https://fraviont.com` → Performance ≥ 90
- `https://fraviont.com/shop` → Performance ≥ 85
- `https://fraviont.com/product/[any-slug]` → Performance ≥ 85

If LCP > 2.5s: check hero section, ensure above-fold images have `priority` prop.
If CLS > 0.1: check skeleton heights match loaded content.
