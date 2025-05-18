"use server"

import { db } from "@/lib/db"
import { AIResponse } from "@/lib/langchain"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"





const NewMessage = async (q: string, userId: string)=>{
    
    const res = db.message.create({
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

        console.log(msg)
        const [res1, res2]  = await Promise.all([
            AIResponse(msg, userId),

            
            NewMessage(msg, userId)
        ])
        if(res1.output?.updated===true){
            const [res3,res4] = await Promise.all([
                await db.task.deleteMany({
                    where:{
                        userId:session.user.id,
                    
                    }
                }),
                await db.task.createMany({
                    data: res1.output.tasks.map((task: any) => ({
                    title: task.name,
                    startTime: String(task.startTime),
                    duration: String(task.duration),
                    priority: task.priority.toUpperCase(), // e.g. "HIGH"
                    userId: session.user.id,
               
                    
                    })),
                })
    
            ])

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
        console.log(e)
        const finalres = await db.message.create({
            data:{
                userId,
                content:"Oops! An error occured.",
                role: "AI",
                updated: false
            }
        })
        return {error: e, message: finalres}
    }
}   