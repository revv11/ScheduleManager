import { db } from "./db";
import { HumanMessage, AIMessage } from "@langchain/core/messages";





async function fetchMessagesFromDB(userId: string){
    const res = await db.message.findMany({
        where: {
            userId
        },
        orderBy:{
            createdAt: "asc"
        }
    })

    const chatHistory = res.map((doc) =>
        doc.role === "USER"
          ? new HumanMessage(doc.content)
          : new AIMessage(doc.content)
    );
    
    return chatHistory
    
}

export async function AIResponse(q: string, userId: string){

    const chatHistory = await fetchMessagesFromDB(userId);

    return "hehehe"
}