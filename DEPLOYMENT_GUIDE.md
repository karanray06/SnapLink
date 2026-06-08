# SnapLink - Complete File Structure & Implementation Guide

## 📁 Project File Tree

```
snaplink/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── shorten/
│   │   │   │   └── route.ts                 # POST endpoint for URL shortening
│   │   │   ├── analytics/[shortId]/
│   │   │   │   └── route.ts                 # GET analytics data (protected)
│   │   │   └── user/
│   │   │       └── links/
│   │   │           ├── route.ts             # GET user's links (paginated)
│   │   │           └── [id]/route.ts        # DELETE user link
│   │   ├── [shortId]/
│   │   │   ├── route.ts                     # GET - Redirect handler
│   │   │   └── stats/page.tsx               # Public analytics page
│   │   ├── dashboard/page.tsx               # User dashboard (authenticated)
│   │   ├── layout.tsx                       # Root layout with Clerk Provider
│   │   ├── page.tsx                         # Homepage
│   │   ├── not-found.tsx                    # Custom 404 page
│   │   └── globals.css                      # Tailwind base styles
│   ├── db/
│   │   ├── schema.ts                        # Drizzle ORM schema
│   │   └── index.ts                         # Database connection
│   ├── lib/
│   │   ├── utils.ts                         # Utility functions (cn, validation, formatting)
│   │   └── redis.ts                         # Redis operations (cache, rate limit)
│   └── components/
│       └── ui/
│           ├── button.tsx                   # Button component
│           ├── input.tsx                    # Input component
│           ├── label.tsx                    # Label component
│           ├── card.tsx                     # Card component
│           └── index.ts                     # Component exports
├── drizzle/                                 # Generated migrations (auto)
├── .env.example                             # Environment template
├── .gitignore                               # Git ignore rules
├── components.json                          # Component config
├── drizzle.config.ts                        # Drizzle Kit config
├── next.config.mjs                          # Next.js config
├── postcss.config.mjs                       # PostCSS config
├── tailwind.config.ts                       # Tailwind config
├── tsconfig.json                            # TypeScript config
├── vercel.json                              # Vercel deployment config
├── package.json                             # Dependencies & scripts
└── README.md                                # Full documentation
```

## 🚀 Quick Start

### Local Development
```bash
# 1. Clone and install
git clone https://github.com/karanray06/SnapLink.git
cd SnapLink
npm install

# 2. Setup .env.local
cp .env.example .env.local
# Fill in your credentials:
# - NEON_DATABASE_URL from Neon dashboard
# - UPSTASH_REDIS_REST_URL from Upstash
# - UPSTASH_REDIS_REST_TOKEN from Upstash
# - CLERK keys from Clerk dashboard
# - NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 3. Initialize database
npm run db:push

# 4. Run development server
npm run dev
# Open http://localhost:3000
```

### Vercel Deployment
```bash
# 1. Fork repository
# 2. Connect to Vercel (auto-detected as Next.js project)
# 3. Add environment variables in Vercel dashboard
# 4. Deploy (automatic on push to main)
```

## 🔧 Configuration Files

### drizzle.config.ts
Configures Drizzle ORM to use Neon PostgreSQL. Used for migrations.

### next.config.mjs
- Enables SWC minification for faster builds
- Adds security headers (X-Content-Type-Options, etc.)
- Optimizes production builds

### tailwind.config.ts
- Includes tailwindcss-animate plugin
- Defines design tokens (colors, animations)
- Extends default Tailwind theme

### tsconfig.json
- Strict type checking enabled
- Path alias: `@/*` points to `./src/*`
- Includes Next.js plugin

### vercel.json
- Defines environment variables for deployment
- Uses Vercel secrets (referenced with @)

## 📊 Database Schema

### URLs Table
```sql
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  short_id VARCHAR(7) UNIQUE NOT NULL,
  long_url TEXT NOT NULL,
  custom_alias VARCHAR(50) UNIQUE,
  user_id VARCHAR(255),  -- Clerk user ID
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  click_count INTEGER DEFAULT 0
);

CREATE INDEX short_id_idx ON urls(short_id);
CREATE INDEX custom_alias_idx ON urls(custom_alias);
CREATE INDEX user_id_idx ON urls(user_id);
CREATE INDEX expires_at_idx ON urls(expires_at);
```

### Clicks Table
```sql
CREATE TABLE clicks (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  country VARCHAR(2),  -- ISO 3166-1 alpha-2
  referrer TEXT,
  device VARCHAR(50)
);

CREATE INDEX url_id_idx ON clicks(url_id);
CREATE INDEX timestamp_idx ON clicks(timestamp);
CREATE INDEX country_idx ON clicks(country);
```

## 🔗 API Reference

### 1. Shorten URL
**Endpoint:** `POST /api/shorten`
```json
{
  "longUrl": "https://example.com/very-long-url",
  "customAlias": "my-short-url",  // optional
  "expiryDate": "2025-12-31T23:59:59Z"  // optional ISO date
}
```
**Response:**
```json
{
  "shortUrl": "https://yourdomain.com/my-short-url",
  "shortId": "my-short-url",
  "longUrl": "https://example.com/very-long-url",
  "createdAt": "2024-01-15T10:30:00Z"
}
```
**Rate Limit:** 20 requests/minute per IP

### 2. Redirect (with Analytics)
**Endpoint:** `GET /[shortId]`
- Returns HTTP 302 redirect
- Records analytics in background (country, referrer, device)
- Checks Redis cache first, then database
- Returns 404 if expired or not found

### 3. Get Analytics
**Endpoint:** `GET /api/analytics/[shortId]`
- **Protected:** Only link creator can access
- Returns: Total clicks, by country (top 5), by device, top referrers, timeline (30 days)
```json
{
  "shortId": "abc123",
  "longUrl": "https://example.com/long",
  "totalClicks": 1234,
  "clicksByCountry": [
    { "country": "US", "count": 450 },
    { "country": "GB", "count": 230 }
  ],
  "clicksByDevice": [
    { "device": "Desktop", "count": 800 },
    { "device": "Mobile", "count": 400 }
  ],
  "topReferrers": [
    { "referrer": "twitter.com", "count": 200 }
  ],
  "timeline": [
    { "date": "2024-01-14", "count": 45 },
    { "date": "2024-01-15", "count": 87 }
  ]
}
```

### 4. User Links
**Endpoint:** `GET /api/user/links?page=1&limit=10`
- **Protected:** Requires authentication
- Returns paginated list of user's links

**Endpoint:** `DELETE /api/user/links/[id]`
- **Protected:** Only link creator can delete
- Removes link from database and cache

## 🎨 Design System

### Colors
- **Primary:** `#6C63FF` (Purple) - Main CTA, gradients
- **Secondary:** `#FF6584` (Pink) - Accent, gradients
- **Accent:** `#00D4FF` (Cyan) - Highlights
- **Background:** `#0A0A0F` (Near Black) - Base
- **Surface:** `rgba(255,255,255,0.05)` - Cards

### Typography
- **Body:** Inter (system default)
- **Size Scale:** sm (12px), base (14px), lg (16px), xl (18px), 2xl+ for headings

### Components
- **Cards:** Glassmorphism with backdrop-blur-sm, border-white/10
- **Buttons:** Gradient background, rounded-lg, 44px minimum height
- **Inputs:** Dark background (black/40), white text, focus ring in primary color
- **Animations:** Framer Motion for smooth page transitions

## 🔐 Security Features

1. **Rate Limiting**
   - 20 requests/minute per IP using Redis sliding window
   - Returns 429 with Retry-After header

2. **Authentication**
   - Clerk handles user signup/signin
   - Protected routes verify userId via auth()
   - Dashboard requires authentication

3. **Authorization**
   - Users can only view/delete their own links
   - Analytics endpoint verifies link ownership
   - Anonymous users can only view public stats

4. **Data Validation**
   - URL format validation using zod
   - Custom alias validation (alphanumeric, hyphen, underscore)
   - Expiry date must be in future

5. **Headers**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: SAMEORIGIN
   - X-XSS-Protection: 1; mode=block

## 📈 Performance Optimizations

1. **Redis Caching**
   - 24-hour TTL for URL lookups
   - Significantly reduces database queries
   - Cache invalidation on link deletion

2. **Database Connection Pooling**
   - Neon handles automatic connection pooling
   - Optimized for serverless environment

3. **Async Analytics**
   - Non-blocking background recording
   - Fire-and-forget promises
   - Doesn't slow down redirect response

4. **Query Optimization**
   - Indexes on frequently queried columns
   - Pagination on user links (10 per page)
   - 30-day window for analytics

## 🛠 Troubleshooting

### Database Connection Issues
```bash
# Test connection
npm run db:push

# View database status
npm run db:studio
```

### Cache Issues
```bash
# Redis endpoint should work with HTTP (not TCP)
# Verify UPSTASH_REDIS_REST_URL includes /rest/v1/
```

### Authentication Issues
```bash
# Verify Clerk keys are set in .env.local
# Check Clerk dashboard for API key settings
```

### Vercel Deployment Issues
```bash
# Check build logs in Vercel dashboard
# Ensure all environment variables are set
# Run: npm run build locally to test
```

## 📝 Environment Variables

```
# Database
NEON_DATABASE_URL=postgresql://...

# Redis Cache
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Application
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 🚢 Deployment Checklist

- [ ] Fork repository on GitHub
- [ ] Connect to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Run `npm run db:push` after deployment
- [ ] Test homepage at /
- [ ] Test shortening functionality
- [ ] Test dashboard (requires login)
- [ ] Test redirect with a short link
- [ ] Verify analytics page
- [ ] Check Upstash Redis dashboard
- [ ] Monitor Neon database usage
- [ ] Set custom domain (optional)

---

**Built with ❤️ using Next.js 14, Neon, Upstash, and Vercel**
