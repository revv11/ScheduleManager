"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth"
import { db } from "./db"




export async function refresh(){
    
    const session = await getServerSession(authOptions)
    try{
        const res = await db.task.findMany({
            where:{
                userId: session.user.id
            }
        })
        return {newSchedule: res}
      
    }
    catch(e){
        console.log(e)
        throw new Error("Unable to refresh")
    }
}