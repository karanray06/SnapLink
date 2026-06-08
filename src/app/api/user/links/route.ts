import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { urls } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "nodejs";

const ITEMS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || ITEMS_PER_PAGE.toString(), 10);

    const offset = (page - 1) * limit;

    // Get total count
    const totalCount = await db.query.urls.findMany({
      where: eq(urls.userId, userId),
      columns: { id: true },
    });

    const totalPages = Math.ceil(totalCount.length / limit);

    // Get paginated links
    const userLinks = await db.query.urls.findMany({
      where: eq(urls.userId, userId),
      orderBy: desc(urls.createdAt),
      limit,
      offset,
    });

    return NextResponse.json({
      links: userLinks,
      page,
      limit,
      totalPages,
      totalCount: totalCount.length,
    });
  } catch (error) {
    console.error("[/api/user/links]", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}
