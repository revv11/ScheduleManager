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

        await db.message.create({
            data:{
                userId,
                content:JSON.stringify(res1),
                role: "AI"

            }
        })

        

        return {success: true, message: res1}

       

    }
    catch(e){
        console.log(e)
        return {error: e, message: "Oops! an error occured"}
    }
}   