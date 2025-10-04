import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log("API /tasks - Session user ID:", session?.user?.id);

  if (!session) {
    return NextResponse.json({ error: "Authentication error" });
  }
  try {
    const res = await db.task.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        startTime: "asc"
      }
    });
    console.log("API /tasks - Found tasks:", res);

    return NextResponse.json({ success: true, tasks: res });
  } catch (e) {
    console.log("API /tasks error:", e);
    return NextResponse.json(
      { error: e, message: "Unable to fetch Recommendations" },
      { status: 200 },
    );
  }
}
