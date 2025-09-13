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
        
        if(res1.output?.updated===true){
            
            try {
                // Delete existing tasks first
                const deleteResult = await db.task.deleteMany({
                    where:{
                        userId:session.user.id,
                    }
                })
                // Then create new tasks
                const tasksToCreate = res1.output.tasks.map((task: any) => {
                    return {
                        title: task.name,
                        startTime: String(task.startTime),
                        duration: String(task.duration),
                        priority: task.priority.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW', // Ensure proper typing
                        userId: session.user.id,
                    };
                });
                
                const createResult = await db.task.createMany({
                    data: tasksToCreate
                });
            } catch (taskError) {
                console.error("Error in task operations:", taskError);
                throw taskError; // Re-throw to be caught by outer catch
            }
        }


        const finalres = await db.message.create({
            data:{
                userId,
                content:res1.output?.description,
                role: "AI",
                updated: res1.output?.updated
            }
        })


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