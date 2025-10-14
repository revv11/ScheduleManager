import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const subTasks = await db.subTask.findMany({
      where: {
        task: {
          userId: session.user.id
        }
      },
      include: {
        task: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      subTasks: subTasks.map(st => ({
        id: st.id,
        taskId: st.taskId,
        description: st.description,
        isCompleted: st.isCompleted
      }))
    });
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch subtasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, description } = body;

    if (!taskId || !description) {
      return NextResponse.json({ success: false, error: 'TaskId and description are required' }, { status: 400 });
    }

    // Verify the task belongs to the user
    const task = await db.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id
      }
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found or unauthorized' }, { status: 404 });
    }

    const subTask = await db.subTask.create({
      data: {
        taskId,
        description,
        isCompleted: false
      }
    });

    return NextResponse.json({ 
      success: true, 
      subTask: {
        id: subTask.id,
        taskId: subTask.taskId,
        description: subTask.description,
        isCompleted: subTask.isCompleted
      }
    });
  } catch (error) {
    console.error('Error creating subtask:', error);
    return NextResponse.json({ success: false, error: 'Failed to create subtask' }, { status: 500 });
  }
}