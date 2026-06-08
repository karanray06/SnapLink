# SnapLink - Serverless URL Shortener

SnapLink is a production-ready, blazing-fast URL shortener built on Next.js 14. It features advanced analytics, QR code generation, custom aliases, and URL expiration—all deployed on Vercel with a serverless PostgreSQL database.

## Features

- **Lightning-Fast Redirects** - Sub-50ms redirects globally using Upstash Redis and Vercel's edge network
- **Advanced Analytics** - Track clicks by country, device type, and referrer source
- **Custom Short URLs** - Create memorable custom aliases for your links
- **Expiry Management** - Set expiration dates on short links
- **QR Code Generation** - Automatic QR codes for every shortened URL
- **User Authentication** - Secure link management with Clerk authentication
- **Dark Mode UI** - Beautiful glassmorphism design with Framer Motion animations
- **Rate Limiting** - Built-in protection against abuse

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Neon PostgreSQL (serverless)
- **Cache**: Upstash Redis (HTTP-based, serverless-safe)
- **ORM**: Drizzle ORM
- **Auth**: Clerk
- **UI**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Local Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use Neon for free)
- Redis instance (or use Upstash)
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/karanray06/SnapLink.git
   cd SnapLink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the variables in `.env.local`:
   - `NEON_DATABASE_URL` - Get from Neon dashboard
   - `UPSTASH_REDIS_REST_URL` - Get from Upstash dashboard
   - `UPSTASH_REDIS_REST_TOKEN` - Get from Upstash dashboard
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Get from Clerk dashboard
   - `CLERK_SECRET_KEY` - Get from Clerk dashboard
   - `NEXT_PUBLIC_BASE_URL` - `http://localhost:3000` for local development

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Vercel Deployment

### Prerequisites

- Fork this repository on GitHub
- Vercel account (free)
- Neon account (free tier available)
- Upstash account (free tier available)
- Clerk account (free tier available)

### Deployment Steps

1. **Fork and connect to Vercel**
   - Fork the repository on GitHub
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project" and select your forked repository
   - Vercel will auto-detect it's a Next.js project

2. **Set environment variables in Vercel**
   - In your Vercel project settings, go to "Environment Variables"
   - Add all variables from `.env.example`:
     - `NEON_DATABASE_URL`
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `NEXT_PUBLIC_BASE_URL` (your Vercel domain, e.g., `https://snaplink-xyz.vercel.app`)

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application automatically

4. **Run migrations (if needed)**
   - Once deployed, use Drizzle Kit to push schema changes:
   ```bash
   npm run db:push
   ```

## API Endpoints

### Shorten URL
```
POST /api/shorten
Content-Type: application/json

{
  "longUrl": "https://example.com/very/long/url",
  "customAlias": "my-link",  // optional
  "expiryDate": "2025-12-31T23:59:59Z"  // optional
}
```

### Get Analytics
```
GET /api/analytics/[shortId]
```
Returns: Total clicks, clicks by country, device type, referrers, and timeline

### User Links
```
GET /api/user/links?page=1&limit=10
DELETE /api/user/links/[id]
```

## Database Schema

### URLs Table
- `id` - Unique identifier
- `shortId` - 7-character unique short code
- `longUrl` - The original long URL
- `customAlias` - Optional custom short code
- `userId` - Clerk user ID (nullable for anonymous links)
- `createdAt` - Creation timestamp
- `expiresAt` - Optional expiration date
- `clickCount` - Number of clicks

### Clicks Table
- `id` - Unique identifier
- `urlId` - Reference to URLs table
- `timestamp` - When the click occurred
- `country` - ISO 3166-1 alpha-2 country code
- `referrer` - HTTP referrer
- `device` - Device type (Desktop, Mobile, Tablet)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── shorten/route.ts          # URL shortening endpoint
│   │   ├── analytics/[shortId]/      # Analytics endpoint
│   │   └── user/links/               # User link management
│   ├── [shortId]/
│   │   ├── route.ts                  # Redirect handler
│   │   └── stats/page.tsx            # Public analytics page
│   ├── dashboard/page.tsx            # User dashboard
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Homepage
│   └── not-found.tsx                 # 404 page
├── db/
│   ├── schema.ts                     # Drizzle schema
│   └── index.ts                      # Database connection
├── lib/
│   ├── utils.ts                      # Utility functions
│   └── redis.ts                      # Redis cache operations
└── components/                       # Reusable UI components
```

## Performance Optimizations

- **Edge Runtime**: Redirects use Node.js runtime for reliability
- **Redis Caching**: 24-hour cache for URL lookups
- **Database Connection Pooling**: Neon's built-in connection pooling
- **Rate Limiting**: 20 requests/minute per IP
- **Async Analytics**: Non-blocking background analytics recording

## Customization

### Change Theme Colors
Edit `tailwind.config.ts` and `src/app/layout.tsx`:
- Primary: `#6C63FF` (purple)
- Secondary: `#FF6584` (pink)
- Accent: `#00D4FF` (cyan)

### Add Custom Domain
1. Add your domain in Vercel project settings
2. Update `NEXT_PUBLIC_BASE_URL` environment variable
3. Configure DNS records as shown in Vercel dashboard

## Monitoring

- Use Vercel Analytics for traffic insights
- Check Upstash Redis dashboard for cache stats
- Monitor Neon database metrics in dashboard
- View error logs in Vercel function logs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- GitHub Issues: [Report a bug](https://github.com/karanray06/SnapLink/issues)
- Documentation: Check HLD.md for architecture details

---

**Built with ❤️ using Next.js 14, Neon, and Vercel**

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
