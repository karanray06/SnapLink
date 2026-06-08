import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { urls, clicks } from "@/db/schema";
import { eq, desc, and, gte, sql, gt } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const { userId } = auth();
    const shortId = params.shortId;

    // Get URL record
    const urlRecord = await db.query.urls.findFirst({
      where: eq(urls.shortId, shortId),
    });

    if (!urlRecord) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    // Verify ownership (only owner can see analytics)
    if (urlRecord.userId && userId !== urlRecord.userId) {
      return NextResponse.json(
        { error: "Unauthorized to view analytics for this link" },
        { status: 403 }
      );
    }

    // Get total clicks
    const totalClicks = urlRecord.clickCount || 0;

    // Get clicks by country (top 5)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const countryStats = await db
      .select({
        country: clicks.country,
        count: sql<number>`count(*)`,
      })
      .from(clicks)
      .where(
        and(
          eq(clicks.urlId, urlRecord.id),
          gte(clicks.timestamp, thirtyDaysAgo)
        )
      )
      .groupBy(clicks.country)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);

    // Get clicks by device
    const deviceStats = await db
      .select({
        device: clicks.device,
        count: sql<number>`count(*)`,
      })
      .from(clicks)
      .where(
        and(
          eq(clicks.urlId, urlRecord.id),
          gte(clicks.timestamp, thirtyDaysAgo)
        )
      )
      .groupBy(clicks.device)
      .orderBy(desc(sql<number>`count(*)`));

    // Get top referrers (top 5)
    const referrerStats = await db
      .select({
        referrer: clicks.referrer,
        count: sql<number>`count(*)`,
      })
      .from(clicks)
      .where(
        and(
          eq(clicks.urlId, urlRecord.id),
          gte(clicks.timestamp, thirtyDaysAgo),
          gt(clicks.referrer, "")
        )
      )
      .groupBy(clicks.referrer)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);

    // Get clicks timeline (last 30 days)
    const timelineStats = await db
      .select({
        date: sql<string>`DATE(${clicks.timestamp})`,
        count: sql<number>`count(*)`,
      })
      .from(clicks)
      .where(
        and(
          eq(clicks.urlId, urlRecord.id),
          gte(clicks.timestamp, thirtyDaysAgo)
        )
      )
      .groupBy(sql<string>`DATE(${clicks.timestamp})`)
      .orderBy(sql<string>`DATE(${clicks.timestamp})`);

    return NextResponse.json({
      shortId,
      longUrl: urlRecord.longUrl,
      totalClicks,
      clicksByCountry: countryStats || [],
      clicksByDevice: deviceStats || [],
      topReferrers: referrerStats || [],
      timeline: timelineStats || [],
      createdAt: urlRecord.createdAt?.toISOString(),
      expiresAt: urlRecord.expiresAt?.toISOString() || null,
    });
  } catch (error) {
    console.error("[/api/analytics/[shortId]]", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
