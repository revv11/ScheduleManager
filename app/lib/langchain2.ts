import { db } from "./db";
import { HumanMessage, AIMessage, MessageContent } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableSequence } from "@langchain/core/runnables";
import { AIMessageChunk } from "@langchain/core/messages";



export const model = new ChatGoogleGenerativeAI({
   
    model : "gemini-2.0-flash",
})

function extractJsonFromCodeBlock(str:string) {
  if (typeof str !== 'string') throw new Error('Input must be a string');

  // Remove leading and trailing backticks and "json"
  const cleaned = str.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err:any) {
    console.error('Failed to parse JSON:', err.message);
    return null;
  }
}

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

    const AImessages  = chatHistory.filter((chat)=> chat instanceof AIMessage)
    const lastSuggestion =  AImessages[AImessages.length-1].content ?? {}

    console.log(lastSuggestion)

    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          `You are an AI scheduling assistant that helps users plan their day efficiently.
      
          IMPORTANT: Respond ONLY in valid JSON format with this possible type:
          - {{ "type": "output", "output": {{ "tasks": [task details], "description": [give a brief overview of what did you come up with] }} }}
          
          Rules for schedule generation:
          - Consider existing commitments
          - Prioritize high-priority tasks
          - Allocate realistic time blocks
          - Include breaks
          - Optimize productivity
          - Factor in user's energy levels and context
          - Provide buffer time between tasks
          
          Output JSON Structure for Tasks:
          {{
            "tasks": [
              {{
                "name": "Task Name",
                "duration": minutes,
                "priority": "high/medium/low",
                "startTime": "HH:MM"
              }}
            ]
          }}
          
          Additional Constraints:
          - Ensure total task duration is reasonable
          - Respect user's natural energy rhythms
          - Consider potential interruptions or context switching
          - Suggest short breaks between intense tasks
          - In case the user wants to edit the schedule return the entire schedule again including the new addition

          you also have the context of the previous suggestion as well as the whole chat history
          lastsuggestion: {lastSuggestion}
          
          Example interaction demonstrating ideal response (each line should be a single JSON object i.e respond 1 json at a time. The response you give should be the prompt for the next step):
          {{ "type": "user", "user": "I want to attend a family function at 10 PM. After that, I'll be back around 11:30 PM, and then I wish to read a book." }}

          (Now first check what all tasks are there in lastsuggestion if it exists. If there are clashes you need to reschedule the tasks to ensure the user can complete all the tasks
          lets say the lastsuggestion from you was:
          {{ "type": "output", "output": {{ "tasks": [{{ "name": "Study DSA/OOPS", "duration": 240, "priority": "high", "startTime": "18:00" }}, {{ "name": "Short Break", "duration": 15, "priority": "low", "startTime": "22:00" }}, {{ "name": "Practice Guitar", "duration": 60, "priority": "medium", "startTime": "22:15" }}], "description": "You should prioritize DSA preparation given the upcoming test. Allocate focused study time with short breaks. Include guitar practice after primary study session." }} }}

          you need to reschedule the timetable so the final output would be:)


          //FINAL OUTPUT YOU WILL GENERATE
          {{ 
            "type": "output",
            "output": {{
              "tasks": [
                {{ "name": "Study DSA/OOPS", "duration": 240, "priority": "high", "startTime": "16:00" }},
                {{ "name": "Short Break", "duration": 15, "priority": "low", "startTime": "20:00" }},
                {{ "name": "Practice Guitar", "duration": 60, "priority": "medium", "startTime": "20:15" }},
                {{ "name": "Attend Family Function", "duration": 90, "priority": "medium", "startTime": "22:00" }},
                {{ "name": "Read a Book", "duration": 60, "priority": "low", "startTime": "23:30" }}
              ],
              "description": "To ensure all tasks are completed, start studying DSA/OOPS earlier at 4 PM. Follow it with a short break and guitar practice. Attend the family function at 10 PM and unwind by reading a book afterward."
            }}
          }}


          

      `
        ],
        ...chatHistory.map((msg) => [msg._getType(), msg.content] as [string, string]),
        ["user", "{input}"],
        
      ],
     
    );
      const chain = RunnableSequence.from([
        historyAwareRetrievalPrompt,
        model
      ]);
      
      const res = await chain.invoke({
        llm: model,
        lastSuggestion,
        input: "I have to go for a cricket match at 10pm after that ill be back at around 11:30 then onwards i wish to read a book",
      })
      
      const resstring = res.content.toString()

      const finalres = extractJsonFromCodeBlock(resstring)
      console.log("finalres",finalres)
      

    return finalres
}