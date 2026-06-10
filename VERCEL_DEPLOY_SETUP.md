# SnapLink - Complete Vercel Deployment Guide

## Prerequisites

Before deploying, you need:

1. **GitHub Account** - Repository already set up: https://github.com/karanray06/SnapLink
2. **Vercel Account** - Sign up at https://vercel.com
3. **External Services Accounts:**
   - Neon PostgreSQL: https://console.neon.tech
   - Upstash Redis: https://console.upstash.com
   - Clerk: https://dashboard.clerk.com

---

## Step 1: Set Up External Services

### 1.1 Neon PostgreSQL

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project (free tier available)
3. Copy your connection string that looks like:
   ```
   postgresql://neon_user:password@ep-XXXX.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this - you'll need it for Vercel

### 1.2 Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com)
2. Create new Redis database (free tier: 10,000 commands/day)
3. After creation, go to "Details" tab
4. Copy:
   - `REST URL` (looks like: `https://[endpoint].upstash.io`)
   - `REST Token` (looks like a long string)
5. Save both - you'll need them for Vercel

### 1.3 Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Choose your sign-in methods (Email, Google, GitHub recommended)
4. Go to "API Keys" section
5. Copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)
6. Save both - you'll need them for Vercel

---

## Step 2: Connect GitHub to Vercel

### Simple Method (Recommended):

1. Go to https://vercel.com/new
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Select the **SnapLink** repository
5. Vercel auto-detects it as a Next.js project
6. Click **"Deploy"** (we'll add env vars next)

---

## Step 3: Add Environment Variables in Vercel

After Vercel creates your project:

1. **Go to Project Settings** → **Environment Variables**
2. Add each variable:

| Variable Name | Value | Type |
|---|---|---|
| `NEON_DATABASE_URL` | Your Neon connection string from Step 1.1 | Secret |
| `UPSTASH_REDIS_REST_URL` | Your Upstash REST URL from Step 1.2 | Secret |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash token from Step 1.2 | Secret |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key from Step 1.3 | Public |
| `CLERK_SECRET_KEY` | Your Clerk secret key from Step 1.3 | Secret |
| `NEXT_PUBLIC_BASE_URL` | `https://snaplink-xxxxx.vercel.app` (your Vercel domain) | Public |

**Important:** After adding variables, **redeploy** by going to Deployments → Click latest → **Redeploy**

---

## Step 4: Initialize Database Schema

After first deployment:

### Option A: Using Vercel CLI (Fastest)
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login
vercel login

# Navigate to project
cd c:\Users\dalir\Desktop\URL_SHORTNER

# Pull env variables
vercel env pull

# Run database migrations
npm run db:push
```

### Option B: Manual via Neon
1. Go to Neon Console
2. Open SQL Editor
3. Create tables manually using schema from `src/db/schema.ts`

### Option C: Using Drizzle Studio
```bash
# If you have .env.local set up locally
npm run db:studio
```

---

## Step 5: Deploy with GitHub Actions (Auto CI/CD)

For automatic deployments on every push to main:

1. **Add Vercel Secrets to GitHub:**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add:
     - `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
     - `VERCEL_ORG_ID` - From your Vercel account settings
     - `VERCEL_PROJECT_ID` - From your Vercel project settings

2. **GitHub Actions workflow already created** at `.github/workflows/deploy.yml`
   - This auto-deploys on push to main
   - Runs tests and builds before deployment

---

## Step 6: Test Your Deployment

Once deployed:

1. **Visit your domain:** `https://snaplink-xxxxx.vercel.app`
2. **Test shortening:** 
   - Enter a long URL
   - Should get a short link back
3. **Test redirect:** 
   - Copy the short link
   - Visit it in new tab
   - Should redirect to original URL
4. **Test analytics:**
   - Click on "View Stats"
   - Should show analytics data
5. **Test dashboard:**
   - Sign in with Clerk
   - Visit `/dashboard`
   - Should see your links

---

## Step 7: Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Follow DNS instructions
4. Wait for DNS propagation (5-30 minutes)
5. Update `NEXT_PUBLIC_BASE_URL` to your custom domain

---

## Monitoring & Maintenance

### View Logs:
```bash
vercel logs
```

### View Deployments:
- Vercel Dashboard → Deployments tab

### Database Monitoring:
- Neon Console → Monitoring
- Check query performance and connection usage

### Cache Monitoring:
- Upstash Console → Overview
- Check requests and memory usage

---

## Troubleshooting

### 404 on redirect:
- Check `NEXT_PUBLIC_BASE_URL` is set correctly
- Verify database has data: check Neon Console

### Rate limit errors:
- Check if you're hitting 20 requests/minute limit
- Wait a minute and retry

### Database connection fails:
- Verify `NEON_DATABASE_URL` is correct in Vercel env vars
- Check Neon project is active
- Run: `npm run db:push` locally with `vercel env pull`

### Redis/Cache issues:
- Verify Upstash credentials in Vercel
- Check Upstash Console for active database
- Rate limit is 10,000 commands/day on free tier

### Auth errors:
- Verify Clerk keys in Vercel env vars
- Add your Vercel domain to Clerk's allowed origins
- Go to Clerk → Settings → Domains → Add your Vercel domain

---

## Quick Deployment Checklist

- [ ] All 3 external services (Neon, Upstash, Clerk) created
- [ ] GitHub repository updated with latest code
- [ ] Vercel project created and connected to GitHub
- [ ] All 6 environment variables added in Vercel
- [ ] Database schema initialized (npm run db:push)
- [ ] Deployment successful (check Vercel Deployments)
- [ ] Homepage loads at your Vercel domain
- [ ] Shortening works end-to-end
- [ ] Analytics page loads
- [ ] Dashboard requires authentication
- [ ] GitHub Actions secrets configured (optional but recommended)

---

## Next Steps

1. **Share your link** - Your domain is now live!
2. **Monitor analytics** - Track usage in dashboard
3. **Add custom domain** - Make it more professional
4. **Promote** - Use your short links on social media
5. **Scale** - Upstash and Neon have paid tiers if you exceed free limits

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Upstash Docs: https://upstash.com/docs
- Clerk Docs: https://clerk.com/docs
