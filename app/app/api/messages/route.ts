import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const before = searchParams.get('before'); // For loading older messages

    // Get total count for pagination info
    const totalCount = await db.message.count({
      where: {
        userId: session.user.id,
      },
    });

    const whereClause: any = {
      userId: session.user.id,
    };

    // If 'before' parameter is provided, get messages older than that timestamp
    if (before) {
      whereClause.createdAt = {
        lt: new Date(before)
      };
    }

    // Always get messages in descending order (newest first)
    const messages = await db.message.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // For initial load (page 1, no 'before'), we return newest messages
    // For pagination (with 'before'), we return older messages
    const hasMore = messages.length === limit;

    return NextResponse.json({ 
      success: true, 
      messages: messages.reverse(), // Reverse to show chronological order in UI
      pagination: {
        currentPage: page,
        totalCount,
        hasMore,
        limit,
        oldestMessageDate: messages.length > 0 ? messages[0].createdAt : null
      }
    });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch messages",
      },
      { status: 500 },
    );
  }
}
