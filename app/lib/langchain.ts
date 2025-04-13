import { db } from "./db";
import { HumanMessage, AIMessage, MessageContent } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableSequence } from "@langchain/core/runnables";
import { AIMessageChunk } from "@langchain/core/messages";


export const model = new ChatGoogleGenerativeAI({
   
    model : "gemini-2.0-flash",
})


function extractTextFromJsonContent(chunk: MessageContent): string {
    const content = chunk;
    
    // If content is a string but contains JSON
    if (typeof content === "string") {
      try {
        // Try to parse the string as JSON
        const parsedContent = JSON.parse(content);
        // Extract the text or relevant field from the parsed JSON
        // (Adjust this based on your actual JSON structure)
        if (typeof parsedContent === "object" && parsedContent !== null) {
          if ("text" in parsedContent) {
            return parsedContent.text as string;
          }
          // If your JSON has a different structure, handle it accordingly
          // For example, if the content is in a 'message' field:
          if ("message" in parsedContent) {
            return parsedContent.message as string;
          }
        }
        // If we couldn't find a text field, return the stringified JSON
        return JSON.stringify(parsedContent);
      } catch (e) {
        // If parsing fails, return the original string
        return content;
      }
    }
    
    // If content is already a parsed JSON object
    if (typeof content === "object" && content !== null) {
      // Handle based on your JSON structure
      if ("text" in content) {
        return (content as any).text;
      }
      // Add other conditions based on your JSON structure
      
      // If no specific field found, stringify the whole object
      return JSON.stringify(content);
    }
    
    // Fallback for unexpected formats
    return String(content);
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


const chathistory = [
    new HumanMessage("I have a test tomorrow of DSA, need to study OOPS, also I need to practice guitar for 1 hour for my upcoming show which is day after tomorrow"),
    new AIMessage(JSON.stringify({
      type: "output",
      output: {
        tasks: [
          { name: "Study DSA/OOPS", duration: 240, priority: "high", startTime: "18:00" },
          { name: "Short Break", duration: 15, priority: "low", startTime: "22:00" },
          { name: "Practice Guitar", duration: 60, priority: "medium", startTime: "22:15" }
        ],
        description: "You should prioritize DSA preparation given the upcoming test. Allocate focused study time with short breaks. Include guitar practice after primary study session."
      }
    }))
  ];

export async function AIResponse(q: string, userId: string){

    const chatHistory = await fetchMessagesFromDB(userId);



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
      
      Example interaction demonstrating ideal response (each line should be a single JSON object i.e respond 1 json at a time. The response you give should be the prompt for the next step):
      {{ "type": "user", "user": "I have a test tomorrow of DSA, need to study OOPS, also i need to practice guitar for 1 hour for my upcoming show which is day after tomorrow" }}
      {{ "type": "output", "output": {{ "tasks": [{{ "name": "Study DSA/OOPS", "duration": 240, "priority": "high", "startTime": "18:00" }}, {{ "name": "Short Break", "duration": 15, "priority": "low", "startTime": "22:00" }}, {{ "name": "Practice Guitar", "duration": 60, "priority": "medium", "startTime": "22:15" }}], "description": "You should prioritize DSA preparation given the upcoming test. Allocate focused study time with short breaks. Include guitar practice after primary study session." }} }}
      `
        ],
        ...chatHistory.map((msg) => [msg._getType(), msg.content] as [string, string]),
        ["user", "{input}"]
      ]);
      const chain = RunnableSequence.from([
        historyAwareRetrievalPrompt,
        model
      ]);
      
      // 🔥 Main Function to Run
        const run = async (newInput: string) => {
            const result = await chain.invoke({ input: newInput });
        
            // Parse the model response
            
            const newres = extractTextFromJsonContent(result.content);
            const cleanednewres = newres.replace(/```json|```/g, '').trim();
            console.log(typeof(newres))
            console.log("without json written",newres)
            let newOutput;
            try {
            newOutput = JSON.parse(cleanednewres);
            } 
            catch (err) {

                console.log(err)
                throw new Error("Error parsing model response:");
            
            }
        
            // 🔁 Extract all previous tasks from chatHistory
            const AISuggestions = chatHistory
            .filter((msg) => msg instanceof AIMessage)
            
            const lastSuggestion = extractTextFromJsonContent(AISuggestions[AISuggestions.length-1].content)
           console.log("lastsuggestion",lastSuggestion)
            
            let previoustask
            try {
                previoustask = JSON.parse(lastSuggestion);
            } 
            catch (err) {

                console.log(err)
                throw new Error("Error parsing model response:");
            
            }

        
            // 🧩 Combine previous and current tasks
            const allTasks = [...previoustask.output.tasks, ...newOutput.output.tasks];
        
            // ✅ Final output for the UI
            const finalResponse = {
            type: "output",
            output: {
                tasks: allTasks,
                description: newOutput.output.description
            }
            };
        
            console.log("🔄 Full Response with Merged Tasks:", JSON.stringify(finalResponse, null, 2));
        };
      
      await run("Add 2 hours of web dev for my side project, preferably in the morning");

    return "hehehe"
}