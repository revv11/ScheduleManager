import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { z } from "zod";

// Validation schema for updating tasks
const UpdateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200, "Title too long").optional(),
  startTime: z.string().min(1, "Start time is required").refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid start time format").optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute").max(1440, "Duration cannot exceed 24 hours").optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    console.log("API /tasks/[id] PATCH - Request body:", body);

    // Validate request data
    const validation = UpdateTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validation.error.errors 
        }, 
        { status: 400 }
      );
    }

    // Check if task exists and belongs to user
    const existingTask = await db.task.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const updateData = validation.data;

    // If updating time-related fields, check for conflicts
    if (updateData.startTime || updateData.duration) {
      const startDateTime = updateData.startTime ? new Date(updateData.startTime) : existingTask.startTime;
      const duration = updateData.duration || existingTask.duration;
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

      // Check for conflicts with other tasks (excluding current task)
      const conflictingTasks = await db.task.findMany({
        where: {
          userId: session.user.id,
          id: { not: id }, // Exclude current task
          OR: [
            {
              AND: [
                { startTime: { lt: endDateTime } },
                { 
                  startTime: { 
                    gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
                  }
                }
              ]
            }
          ]
        }
      });

      // Check for actual time overlaps
      const hasConflicts = conflictingTasks.some(task => {
        const taskStart = new Date(task.startTime);
        const taskEnd = new Date(taskStart.getTime() + task.duration * 60 * 1000);
        
        return (
          startDateTime < taskEnd && endDateTime > taskStart
        );
      });

      if (hasConflicts) {
        const conflictDetails = conflictingTasks
          .filter(task => {
            const taskStart = new Date(task.startTime);
            const taskEnd = new Date(taskStart.getTime() + task.duration * 60 * 1000);
            return startDateTime < taskEnd && endDateTime > taskStart;
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

      // Convert startTime to Date if provided
      if (updateData.startTime) {
        updateData.startTime = startDateTime as any;
      }
    }

    // Update the task
    const updatedTask = await db.task.update({
      where: { id: id },
      data: updateData
    });

    console.log("API /tasks/[id] PATCH - Updated task:", updatedTask);

    return NextResponse.json({ 
      success: true, 
      task: updatedTask,
      message: "Task updated successfully"
    });

  } catch (error) {
    console.error("API /tasks/[id] PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    console.log("API /tasks/[id] DELETE - Task ID:", id);

    // Check if task exists and belongs to user
    const existingTask = await db.task.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Delete the task (this will also delete related subtasks due to cascade)
    await db.task.delete({
      where: { id: id }
    });

    console.log("API /tasks/[id] DELETE - Task deleted:", id);

    return NextResponse.json({ 
      success: true, 
      message: "Task deleted successfully"
    });

  } catch (error) {
    console.error("API /tasks/[id] DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to delete task" },
      { status: 500 }
    );
  }
}