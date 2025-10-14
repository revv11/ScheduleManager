"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { AIScheduleGenerator } from "@/lib/langgraph";





const NewMessage = async (q: string, userId: string)=>{
    
    const res = await db.message.create({
        data:{
            userId,
            content: q,
            role: 'USER'
        }
    })

    return res;
}




export default async function userPrompt(msg: string){
    const session = await getServerSession(authOptions)
    if(!session){
        throw new Error("User not found")
    }
    const userId = session.user.id
    try{

        // Store user message first
        const userMessage = await NewMessage(msg, userId);
        
        // Process with enhanced LangGraph agent
        const aiResponse = await AIScheduleGenerator(msg, userId);
        
        console.log("AI Response:", {
            description: aiResponse.description?.substring(0, 100),
            tasksCount: aiResponse.tasks?.length || 0,
            subTasksCount: aiResponse.subTasks?.length || 0
        });

        // The new tool-based LangGraph agent handles all database operations automatically
        // Tasks and SubTasks are created, updated, or deleted using the appropriate tools
        // Messages are also saved automatically within the LangGraph workflow

        // Save AI response to messages (the LangGraph already saves internally, but we need it for the frontend)
        const finalres = await db.message.create({
            data:{
                userId,
                content: aiResponse.description || "I processed your request successfully.",
                role: "AI"
            }
        })

        // Fetch the most up-to-date tasks and subtasks from database after LangGraph processing
        const updatedTasks = await db.task.findMany({
            where: { userId },
            orderBy: { startTime: 'asc' }
        });

        const updatedSubTasks = await db.subTask.findMany({
            where: { task: { userId } },
            include: { task: { select: { id: true, title: true } } },
            orderBy: { id: 'asc' }
        });

        return {
            success: true, 
            message: finalres,
            aiResponse: {
                description: aiResponse.description,
                tasksGenerated: aiResponse.tasks?.length || 0,
                subTasksGenerated: aiResponse.subTasks?.length || 0,
                tasksInSchedule: updatedTasks,
                subTasksInSchedule: updatedSubTasks
            }
        }

       

    }
    catch(e){
        console.error("Error in userPrompt:", e);
        console.error("Error details:", {
            message: e instanceof Error ? e.message : 'Unknown error',
            stack: e instanceof Error ? e.stack : undefined,
            name: e instanceof Error ? e.name : 'Unknown'
        });
        
        const finalres = await db.message.create({
            data:{
                userId,
                content:`Oops! An error occurred`,
                role: "AI"
            }
        })
        return {error: e, message: finalres}
    }
}   