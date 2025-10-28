import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const { id: subtaskId } = await params;
    const { isCompleted } = await req.json();

    if (!subtaskId) {
      return NextResponse.json({ 
        success: false, 
        error: "Subtask ID is required" 
      }, { status: 400 });
    }

    // Verify the subtask belongs to the user
    const existingSubTask = await db.subTask.findFirst({
      where: {
        id: subtaskId,
        task: {
          userId: session.user.id
        }
      }
    });

    if (!existingSubTask) {
      return NextResponse.json({ 
        success: false, 
        error: "Subtask not found or access denied" 
      }, { status: 404 });
    }

    // Update the subtask
    const updatedSubTask = await db.subTask.update({
      where: { id: subtaskId },
      data: { isCompleted: isCompleted }
    });

    return NextResponse.json({
      success: true,
      subTask: {
        id: updatedSubTask.id,
        description: updatedSubTask.description,
        taskId: updatedSubTask.taskId,
        isCompleted: updatedSubTask.isCompleted
      }
    });

  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update subtask" 
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const { id: subtaskId } = await params;

    if (!subtaskId) {
      return NextResponse.json({ 
        success: false, 
        error: "Subtask ID is required" 
      }, { status: 400 });
    }

    // Verify the subtask belongs to the user
    const existingSubTask = await db.subTask.findFirst({
      where: {
        id: subtaskId,
        task: {
          userId: session.user.id
        }
      }
    });

    if (!existingSubTask) {
      return NextResponse.json({ 
        success: false, 
        error: "Subtask not found or access denied" 
      }, { status: 404 });
    }

    // Delete the subtask
    await db.subTask.delete({
      where: { id: subtaskId }
    });

    return NextResponse.json({
      success: true,
      message: "Subtask deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting subtask:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete subtask" 
    }, { status: 500 });
  }
}