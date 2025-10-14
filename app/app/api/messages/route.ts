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

    const messages = await db.message.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ success: true, messages });
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
