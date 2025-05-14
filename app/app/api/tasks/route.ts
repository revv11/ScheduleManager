import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/options"



export async function GET(){
    const session = await getServerSession(authOptions)
    if(!session){
        return NextResponse.json({error: "Authentication error"})
    }
    try{
        const res = await db.task.findMany({
            where:{
                userId: session.user.id
            }
        })
   
        return NextResponse.json({success:true, tasks: res})
    }


    catch(e){
        console.log(e)
        return NextResponse.json({error: e, message: "Unable to fetch Recommendations"}, {status:200})
    }
}