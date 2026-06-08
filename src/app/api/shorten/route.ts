import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { urls } from "@/db/schema";
import { eq } from "drizzle-orm";
import { urlSchema, getClientIp } from "@/lib/utils";
import {
  checkRateLimit,
  setCachedUrl,
} from "@/lib/redis";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request.headers);
    const rateLimit = await checkRateLimit(clientIp, 20, 60000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again in a moment.",
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Get authenticated user
    const { userId } = auth();

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = urlSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { longUrl, customAlias, expiryDate } = validation.data;

    // Check if custom alias is already taken
    if (customAlias) {
      const existing = await db.query.urls.findFirst({
        where: eq(urls.customAlias, customAlias),
      });

      if (existing) {
        return NextResponse.json(
          { error: "This custom alias is already taken" },
          { status: 400 }
        );
      }
    }

    // Generate or use custom alias
    const shortId = customAlias || nanoid(7);

    // Check if generated shortId is unique (unlikely but possible)
    if (!customAlias) {
      const existing = await db.query.urls.findFirst({
        where: eq(urls.shortId, shortId),
      });

      if (existing) {
        // Recursively retry with a new ID
        const retryId = nanoid(7);
        return POST(
          new NextRequest(new URL("http://localhost:3000/api/shorten"), {
            method: "POST",
            body: JSON.stringify({
              longUrl,
              customAlias: retryId,
              expiryDate,
            }),
            headers: request.headers,
          })
        );
      }
    }

    // Create URL record
    const expiresAt = expiryDate ? new Date(expiryDate) : null;
    const urlRecord = await db
      .insert(urls)
      .values({
        shortId,
        longUrl,
        customAlias: customAlias || null,
        userId: userId || null,
        expiresAt,
        clickCount: 0,
      })
      .returning();

    // Cache the URL
    await setCachedUrl(shortId, {
      longUrl,
      expiresAt: expiresAt?.toISOString() || null,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shortUrl = `${baseUrl}/${shortId}`;

    return NextResponse.json(
      {
        shortUrl,
        shortId,
        longUrl,
        customAlias: customAlias || null,
        expiresAt: expiresAt?.toISOString() || null,
        createdAt: urlRecord[0].createdAt?.toISOString(),
      },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error("[/api/shorten]", error);
    return NextResponse.json(
      { error: "Failed to shorten URL" },
      { status: 500 }
    );
  }
}
