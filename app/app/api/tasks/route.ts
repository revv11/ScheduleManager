import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { z } from "zod";

// Validation schema for manual task creation
const CreateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200, "Title too long"),
  startTime: z.string().min(1, "Start time is required").refine((val) => {
    // Accept both ISO datetime and datetime-local format
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid start time format"),
  duration: z.number().min(1, "Duration must be at least 1 minute").max(1440, "Duration cannot exceed 24 hours"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().default("MEDIUM")
});

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
        startTime: "asc",
      },
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("API /tasks POST - Request body:", body);

    // Validate request data
    const validation = CreateTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validation.error.errors 
        }, 
        { status: 400 }
      );
    }

    const { title, startTime, duration, priority } = validation.data;

    // Check for time conflicts with existing tasks
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

    const conflictingTasks = await db.task.findMany({
      where: {
        userId: session.user.id,
        OR: [
          // New task starts before existing task ends AND new task ends after existing task starts
          {
            AND: [
              { startTime: { lt: endDateTime } },
              { 
                startTime: { 
                  gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) // Only check tasks from last 24 hours onwards
                }
              }
            ]
          }
        ]
      }
    });

    // Check for actual time overlaps
    const hasConflicts = conflictingTasks.some(existingTask => {
      const existingStart = new Date(existingTask.startTime);
      const existingEnd = new Date(existingStart.getTime() + existingTask.duration * 60 * 1000);
      
      return (
        startDateTime < existingEnd && endDateTime > existingStart
      );
    });

    if (hasConflicts) {
      const conflictDetails = conflictingTasks
        .filter(task => {
          const existingStart = new Date(task.startTime);
          const existingEnd = new Date(existingStart.getTime() + task.duration * 60 * 1000);
          return startDateTime < existingEnd && endDateTime > existingStart;
        })
        .map(task => ({
          id: task.id,
          title: task.title,
          startTime: task.startTime,
          duration: task.duration
        }));

      return NextResponse.json(
        { 
          error: "Time conflict detected", 
          conflictingTasks: conflictDetails 
        }, 
        { status: 409 }
      );
    }

    // Create new task
    const newTask = await db.task.create({
      data: {
        title,
        startTime: startDateTime,
        duration,
        priority,
        userId: session.user.id,
      }
    });

    console.log("API /tasks POST - Created task:", newTask);

    return NextResponse.json({ 
      success: true, 
      task: newTask,
      message: "Task created successfully"
    });

  } catch (error) {
    console.error("API /tasks POST error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to create task" },
      { status: 500 }
    );
  }
}
