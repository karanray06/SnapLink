import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { urls } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { deleteCachedUrl } from "@/lib/redis";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid URL ID" },
        { status: 400 }
      );
    }

    // Get the URL record
    const urlRecord = await db.query.urls.findFirst({
      where: eq(urls.id, id),
    });

    if (!urlRecord) {
      return NextResponse.json(
        { error: "URL not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (urlRecord.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete from database
    await db.delete(urls).where(eq(urls.id, id));

    // Delete from cache
    await deleteCachedUrl(urlRecord.shortId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/user/links/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}
