import { NextResponse } from "next/server";
import { db } from "@/db";
import { urls, clicks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCachedUrl, setCachedUrl } from "@/lib/redis";
import { getDeviceType } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { shortId: string } }
) {
  try {
    const shortId = params.shortId;

    if (!shortId || shortId === "404") {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 1. Check cache first
    const cached = await getCachedUrl(shortId);
    if (cached) {
      // Record analytics in background
      recordAnalyticsAsync(request, shortId);
      
      // Upstash might return an object directly if it parsed the JSON
      const cachedData = typeof cached === "string" ? JSON.parse(cached) : cached;
      
      // Check if expired
      if (cachedData.expiresAt && new Date(cachedData.expiresAt) < new Date()) {
        return NextResponse.redirect(new URL("/?error=expired", request.url));
      }
      
      return NextResponse.redirect(cachedData.longUrl, 302);
    }

    // 2. Query database
    const urlRecord = await db.query.urls.findFirst({
      where: eq(urls.shortId, shortId),
    });

    if (!urlRecord) {
      return NextResponse.redirect(new URL("/?error=not-found", request.url));
    }

    // Check if expired
    if (urlRecord.expiresAt && new Date(urlRecord.expiresAt) < new Date()) {
      return NextResponse.redirect(new URL("/?error=expired", request.url));
    }

    // 3. Cache the URL
    await setCachedUrl(shortId, {
      longUrl: urlRecord.longUrl,
      expiresAt: urlRecord.expiresAt?.toISOString() || null,
    });

    // 4. Record analytics in background
    recordAnalyticsAsync(request, shortId);

    // 5. Redirect
    return NextResponse.redirect(urlRecord.longUrl, 302);
  } catch (error) {
    console.error("[redirect]", error);
    return NextResponse.redirect(new URL("/?error=server-error", request.url));
  }
}

function recordAnalyticsAsync(req: Request, shortId: string) {
  // Fire-and-forget analytics recording
  Promise.resolve()
    .then(async () => {
      try {
        const country =
          (req.headers.get("x-vercel-ip-country") as string) || "XX";
        const userAgent = (req.headers.get("user-agent") as string) || "Unknown";
        const referrer = (req.headers.get("referer") as string) || "Direct";
        const device = getDeviceType(userAgent);

        // Get the URL record
        const urlRecord = await db.query.urls.findFirst({
          where: eq(urls.shortId, shortId),
        });

        if (!urlRecord) return;

        // Record the click
        await db.insert(clicks).values({
          urlId: urlRecord.id,
          country,
          referrer,
          device,
        });

        // Update click count
        await db
          .update(urls)
          .set({ clickCount: urlRecord.clickCount + 1 })
          .where(eq(urls.id, urlRecord.id));
      } catch (error) {
        console.error("[analytics background]", error);
      }
    })
    .catch(console.error);
}
