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

// Helper function to get current date and time in ISO format
function getCurrentDateTime() {
  const now = new Date();
  return {
    isoString: now.toISOString(),
    dateOnly: now.toISOString().split('T')[0], // YYYY-MM-DD
    timeOnly: now.toTimeString().split(' ')[0], // HH:MM:SS
    humanReadable: now.toLocaleString(),
    timestamp: now.getTime()
  };
}

// Format datetime for display purposes
function formatDateTime(date: Date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return `${dd}/${mm}/${yyyy} ${time}`;
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

// Dynamic example output with current date
function getExampleOutput() {
  const currentDate = new Date().toISOString().split('T')[0];
  return {
    "type": "output",
    "output": {
      "tasks": [
        { "name": "Study DSA/OOPS", "duration": 240, "priority": "high", "startTime": `${currentDate}T15:22:00` },
        { "name": "Short Break", "duration": 15, "priority": "low", "startTime": `${currentDate}T19:02:00` },
        { "name": "Practice Guitar", "duration": 60, "priority": "medium", "startTime": `${currentDate}T19:17:00` },
        { "name": "Attend Family Function", "duration": 90, "priority": "medium", "startTime": `${currentDate}T22:00:00` },
        { "name": "Read a Book", "duration": 60, "priority": "low", "startTime": `${currentDate}T23:30:00` }
      ],
      "description": "To ensure all tasks are completed, start studying DSA/OOPS earlier at 4 PM. Follow it with a short break and guitar practice. Attend the family function at 10 PM and unwind by reading a book afterward.",
      "updated": true
    }
  }
}

export const model = new ChatGoogleGenerativeAI({
    model : "gemini-2.0-flash",
})

function extractJsonFromCodeBlock(str:string) {
  if (typeof str !== 'string') throw new Error('Input must be a string');
  
  let cleaned = str;
  
  const jsonBlockMatch = str.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim();
  } else {
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    } else {
      console.error('No JSON found in response');
      return null;
    }
  }

  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err:any) {
    console.error('Failed to parse JSON:', err.message);
    console.error('Cleaned string that failed to parse:', cleaned);
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
    const dateTimeInfo = getCurrentDateTime();
    const chats = await fetchMessagesFromDB(userId);
    const lastsug = await getLastSuggestion(userId);
    const lastSuggestion = JSON.stringify(lastsug);
    const egoutput = getExampleOutput();
    
    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          `You are an AI scheduling assistant that helps users plan their day efficiently.
      
          CRITICAL: You MUST respond ONLY with valid JSON wrapped in \`\`\`json\`\`\` code blocks. Never use plain text.
          
          CURRENT DATE AND TIME INFORMATION:
          - Current ISO DateTime: {currentISODateTime}
          - Current Date: {currentDate}
          - Current Time: {currentTime}
          - Human Readable: {humanReadableTime}
          
          CRITICAL TIME RULES:
          1. ALL task startTimes MUST be in ISO 8601 format: YYYY-MM-DDTHH:MM:SS
          2. ALL task startTimes MUST be AFTER the current time ({currentISODateTime})
          3. Use the CURRENT DATE ({currentDate}) for today's tasks
          4. For tasks tomorrow, add one day to the current date
          5. NEVER schedule tasks in the past
          
          REQUIRED FORMAT:
          \`\`\`json
          {{
            "type": "output",
            "output": {{
              "tasks": [task details],
              "description": "brief overview of what you came up with",
              "updated": true/false
            }}
          }}
          \`\`\`
          
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
                "startTime": "YYYY-MM-DDTHH:MM:SS"
              }}
            ]
          }}
          
          Context from previous interactions:
          lastsuggestion: {lastSuggestion}
          if this is empty hence there is not schedule made yet.
          
          Additional Constraints:
          - Ensure total task duration is reasonable
          - Respect user's natural energy rhythms
          - Consider potential interruptions or context switching
          - Suggest short breaks between intense tasks
          - In case the user wants to edit the schedule return the entire schedule again including the new addition
          - Even if the user asks miscellaneous questions, give the answer in the above stated format
          - Focus on scheduling tasks and providing helpful responses about task management
          
          TIME VALIDATION:
          Before outputting any task, verify:
          1. The startTime is in format: YYYY-MM-DDTHH:MM:SS
          2. The date part matches or is after {currentDate}
          3. If the date is today ({currentDate}), the time must be after {currentTime}
          
          Example of CORRECT startTime formats:
          - "{currentDate}T14:30:00" (2:30 PM today, if current time is before that)
          - "{currentDate}T18:00:00" (6:00 PM today, if current time is before that)
          
          Example of INCORRECT formats (DO NOT USE):
          - "2024-07-02T15:00:00" (wrong year)
          - "18:00" (missing date)
          - "2025-01-17 15:00:00" (wrong format - missing T separator)

          Example interaction demonstrating ideal response:
          {egprompt}
          
          If there are existing tasks in lastsuggestion, check for conflicts and reschedule accordingly.
          
          Example output structure:
          {egoutput}

          For non-scheduling queries (like "Hi"), respond in the required JSON format:
          \`\`\`json
          {{
            "type": "output",
            "output": {{
              "tasks": [],
              "description": "Your response here",
              "updated": false
            }}
          }}
          \`\`\`

          REMEMBER: 
          - Current time is {currentISODateTime}
          - All tasks must be scheduled AFTER this time
          - Use ISO 8601 format: YYYY-MM-DDTHH:MM:SS
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
        currentISODateTime: dateTimeInfo.isoString,
        currentDate: dateTimeInfo.dateOnly,
        currentTime: dateTimeInfo.timeOnly,
        humanReadableTime: dateTimeInfo.humanReadable
    });
    console.log(res.content)
    const resstring = res.content.toString();

    const finalres = extractJsonFromCodeBlock(resstring);
    
    if (!finalres) {
        console.error("Failed to parse JSON from AI response");
        return {
            type: "output",
            output: {
                tasks: [],
                description: "Sorry, I couldn't process your request properly. Please try again.",
                updated: false
            }
        };
    }
    
    // Validate that all task times are in the future
    if (finalres.output && finalres.output.tasks) {
        const now = new Date();
        finalres.output.tasks = finalres.output.tasks.filter((task: any) => {
            if (task.startTime) {
                const taskTime = new Date(task.startTime);
                if (taskTime <= now) {
                    console.warn(`Task "${task.name}" has past time ${task.startTime}, filtering out`);
                    return false;
                }
            }
            return true;
        });
    }

    return finalres;
}