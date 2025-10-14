import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all subtasks for the user's tasks
    const subTasks = await db.subTask.findMany({
      where: {
        task: {
          userId: userId
        }
      },
      select: {
        id: true,
        description: true,
        taskId: true,
        isCompleted: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      subTasks: subTasks
    });

  } catch (error) {
    console.error("Error fetching subtasks:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch subtasks" 
    }, { status: 500 });
  }
}

// Optional: Add POST endpoint to create individual subtasks
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const { description, taskId } = await req.json();

    if (!description || !taskId) {
      return NextResponse.json({ 
        success: false, 
        error: "Description and taskId are required" 
      }, { status: 400 });
    }

    // Verify the task belongs to the user
    const task = await db.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id
      }
    });

    if (!task) {
      return NextResponse.json({ 
        success: false, 
        error: "Task not found or access denied" 
      }, { status: 404 });
    }

    // Create the subtask
    const newSubTask = await db.subTask.create({
      data: {
        description: description,
        taskId: taskId,
        isCompleted: false
      }
    });

    return NextResponse.json({
      success: true,
      subTask: {
        id: newSubTask.id,
        description: newSubTask.description,
        taskId: newSubTask.taskId,
        isCompleted: newSubTask.isCompleted
      }
    });

  } catch (error) {
    console.error("Error creating subtask:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create subtask" 
    }, { status: 500 });
  }
}