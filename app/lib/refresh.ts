"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth"
import { db } from "./db"




export async function refresh(){
    
    const session = await getServerSession(authOptions)
    console.log("Refresh function - Session user ID:", session?.user?.id);
    
    try{
        const res = await db.task.findMany({
            where:{
                userId: session.user.id
            }
        })
        console.log("Refresh function - Found tasks:", res);
        return {newSchedule: res}
      
    }
    catch(e){
        console.log("Refresh function error:", e)
        throw new Error("Unable to refresh")
    }
}