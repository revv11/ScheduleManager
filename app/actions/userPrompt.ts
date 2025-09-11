"use server"

import { db } from "@/lib/db"
import { AIResponse } from "@/lib/langchain"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"





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

        const [res1, res2]  = await Promise.all([
            AIResponse(msg, userId),

            
            NewMessage(msg, userId)
        ])
        
        console.log("AI Response received:", JSON.stringify(res1, null, 2));
        console.log("AI Response output:", res1.output);
        console.log("Updated flag:", res1.output?.updated);
        if(res1.output?.updated===true){
            console.log("Tasks to be created:", res1.output.tasks);
            console.log("AI Response output:", JSON.stringify(res1.output, null, 2));
            
            try {
                // Delete existing tasks first
                const deleteResult = await db.task.deleteMany({
                    where:{
                        userId:session.user.id,
                    }
                })
                console.log("Deleted tasks count:", deleteResult.count);
                
                // Then create new tasks
                const tasksToCreate = res1.output.tasks.map((task: any) => {
                    console.log("Processing task:", task);
                    return {
                        title: task.name,
                        startTime: String(task.startTime),
                        duration: String(task.duration),
                        priority: task.priority.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW', // Ensure proper typing
                        userId: session.user.id,
                    };
                });
                console.log("Tasks data to create:", JSON.stringify(tasksToCreate, null, 2));
                
                const createResult = await db.task.createMany({
                    data: tasksToCreate
                });
                console.log("Created tasks count:", createResult.count);
                
                // Verify the tasks were actually created
                const verifyTasks = await db.task.findMany({
                    where: { userId: session.user.id }
                });
                console.log("Tasks in database after creation:", verifyTasks);
            } catch (taskError) {
                console.error("Error in task operations:", taskError);
                throw taskError; // Re-throw to be caught by outer catch
            }
        } else {
            console.log("No tasks to update. Updated flag:", res1.output?.updated);
        }


        const finalres = await db.message.create({
            data:{
                userId,
                content:res1.output?.description,
                role: "AI",
                updated: res1.output?.updated
            }
        })

        // Final verification - check if tasks are still in database
        const finalTasks = await db.task.findMany({
            where: { userId: session.user.id }
        });
        console.log("Final tasks in database:", finalTasks);

        return {success: true, message: finalres}

       

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
                content:`Oops! An error occurred: ${e instanceof Error ? e.message : 'Unknown error'}`,
                role: "AI",
                updated: false
            }
        })
        return {error: e, message: finalres}
    }
}   