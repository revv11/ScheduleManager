"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { db } from "@/lib/db";
import { getServerSession } from "next-auth"

export async function FetchMessages() {
    const session  = await getServerSession(authOptions);

    try{
        const res = await db.message.findMany({
            where:{
                userId: session.user.id
            },
            orderBy:{
                createdAt: "asc"
            }

        })
        const filtered = res.map((message)=>{
            if(message.role === 'USER'){
                return message
            }
            else{
                return {
                    id: message.id,
                    createdAt: message.createdAt,
                    role: message.role,
                    content: JSON.parse(message.content).output.description as string
                }
            }
        })
        return {success: true, messages: filtered, response: res}
    }
    catch(e:any){
        console.log(e)
        return {error: e, message: "Unable to fetch messages"}
    }
   
}