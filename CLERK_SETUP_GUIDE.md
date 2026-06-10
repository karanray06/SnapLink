# Clerk API Keys Setup

## Get Your Clerk API Keys

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com

2. **Sign in** or create a new account

3. **Select or Create Project**
   - Create a new project for SnapLink
   - Name: "SnapLink" or similar

4. **Find Your API Keys**
   - Go to: Settings → API Keys
   - You'll see:
     - **Publishable Key** (starts with `pk_`)
     - **Secret Key** (starts with `sk_`)

5. **Copy Both Keys**
   - Copy the Publishable Key
   - Copy the Secret Key

## Update .env.local

Add these to your `.env.local` file:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_your_key_here
CLERK_SECRET_KEY=sk_your_key_here
```

## Complete Environment Variables

After getting Clerk keys, your `.env.local` should have:

```
NEON_DATABASE_URL=postgresql://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=gQAA...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

## Configure Allowed Redirect URLs in Clerk

After getting keys, configure Clerk for your app:

1. Go to Clerk Dashboard → Settings → URLs
2. Add your Redirect URLs:
   - For local: `http://localhost:3000/sign-in/callback`
   - For Vercel: `https://your-project.vercel.app/sign-in/callback`

## Verify Installation

After updating `.env.local`, run:

```bash
npm run dev
```

The Clerk authentication should be ready to use on the dashboard page.
