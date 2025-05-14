import { db } from "./db";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableSequence } from "@langchain/core/runnables";



async function getLastSuggestion(userId: string){
  try{
    const res = await db.task.findMany({
      where:{
         userId
      }
    })

    return({lastsuggestion: res})
  }
  catch(e){
    console.log(e)
    throw new Error("gg ho gya")
  }
}


function formatDateTime(date: Date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const yy = String(date.getFullYear()).slice(-2);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `${dd}/${mm}${yy} ${time}`;
}


const egprompt = {
  "type": "user",
  "user": "I want to attend a family function at 10 PM. After that, I'll be back around 11:30 PM, and then I wish to read a book."
}

const eglast = {
  "type": "output",
  "output": {
    "tasks": [
      { "name": "Study DSA/OOPS", "duration": 240, "priority": "high", "startTime": "18:00" },
      { "name": "Short Break", "duration": 15, "priority": "low", "startTime": "22:00" },
      { "name": "Practice Guitar", "duration": 60, "priority": "medium", "startTime": "22:15" }
    ],
    "description": "You should prioritize DSA preparation given the upcoming test. Allocate focused study time with short breaks. Include guitar practice after primary study session."
  }
}


const egoutput = {
  "type": "output",
  "output": {
    "tasks": [
      { "name": "Study DSA/OOPS", "duration": 240, "priority": "high", "startTime": "16:00" },
      { "name": "Short Break", "duration": 15, "priority": "low", "startTime": "20:00" },
      { "name": "Practice Guitar", "duration": 60, "priority": "medium", "startTime": "20:15" },
      { "name": "Attend Family Function", "duration": 90, "priority": "medium", "startTime": "22:00" },
      { "name": "Read a Book", "duration": 60, "priority": "low", "startTime": "23:30" }
    ],
    "description": "To ensure all tasks are completed, start studying DSA/OOPS earlier at 4 PM. Follow it with a short break and guitar practice. Attend the family function at 10 PM and unwind by reading a book afterward.",
    "updated": true
  }
}


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
    console.log(chatHistory)
    return chatHistory
    
}



export async function AIResponse(q: string, userId: string){
    const time = formatDateTime(new Date())
    const chats = await fetchMessagesFromDB(userId);
    console.log("chats",chats)

    const lastsug = await getLastSuggestion(userId)
    const lastSuggestion =  JSON.stringify(lastsug)
    
    console.log(lastSuggestion)

    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          `You are an AI scheduling assistant that helps users plan their day efficiently.
      
          IMPORTANT: Respond ONLY in valid JSON format with this possible type:
          - {{ "type": "output", "output": {{ "tasks": [task details], "description": [give a brief overview of what did you come up with], "updated": [boolean value based on whether the tasks in this response is different to the previous response ] }} }}
          
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
          
          you also have the context of the previous suggestion as well as the whole chat history
          lastsuggestion: {lastSuggestion}
          
          Additional Constraints:
          - Ensure total task duration is reasonable
          - Respect user's natural energy rhythms
          - Consider potential interruptions or context switching
          - Suggest short breaks between intense tasks
          - In case the user wants to edit the schedule return the entire schedule again including the new addition
          - Even if the user ask miscellaneous question for example "Hey, what was my last message" give the answer in the above stated format.
          - You also have the current local time of the user so make the schedule accordingly
          

          user local time: {time}

          so the response will be:
          {{"type": "output", "output": {{"tasks": [], "description": "your last message was: I have a test tomorrow of DSA, need to study OOPS, also I need to practice guitar for 1 hour for my upcoming show which is day after tomorrow ", "updated": false}} }}

          Example interaction demonstrating ideal response (each line should be a single JSON object i.e respond 1 json at a time. The response you give should be the prompt for the next step):
          {egprompt}

          (Now first check what all tasks are there in lastsuggestion if it exists. If there are clashes you need to reschedule the tasks to ensure the user can complete all the tasks
          lets say the lastsuggestion from you was:
          {eglast}




          you need to reschedule the timetable in the stated format


          //FINAL OUTPUT YOU WILL GENERATE
          {egoutput}

          //EXAMPLE 2
          Even if the user ask anything else than a schedule request for example give the answer in the above stated format.
          FOR EXAMPLE

          {{"type": "user", "user": "Hi"}} 
        
          {{"type": "output", "output": {{"tasks": [], "description": "Hi im an AI scheduling assistant. How can i help you? ", "updated": false}} }}

          THIS IS JUST AN EXAMPLE RESPOND TO USER AS PER THEIR QUESTION
      `
        ],
        ...chats,
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
        input: q,
        egoutput: JSON.stringify(egoutput),
        egprompt: JSON.stringify(egprompt),
        eglast: JSON.stringify(eglast),
        time
      })
      
      const resstring = res.content.toString()

      const finalres = extractJsonFromCodeBlock(resstring)
      console.log("finalres",JSON.stringify(finalres))
      

    return finalres
}