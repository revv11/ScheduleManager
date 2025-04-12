import { GoogleGenerativeAI, Part } from '@google/generative-ai';


// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Define types for structured responses
interface ScheduleAction {
    type: 'plan' | 'action' | 'output';
    plan?: string;
    output?: string;
    tasks?: TaskDetail[];
}

interface TaskDetail {
    name: string;
    duration: number;
    priority: 'low' | 'medium' | 'high';
    startTime?: string;
}

export async function generateSchedule(prompt: string): Promise<any>{
    // Tools available to the AI
    const tools = {
        // You can add more tools as needed
        // SaveSchedule: async (tasks: TaskDetail[]) => {
        //     // Save generated schedule to database
        //     return await db.schedule.create({
        //         data: {
        //             // Add logic to save schedule
        //             tasks: JSON.stringify(tasks)
        //         }
        //     });
        // }
    };

    // Structured system prompt for schedule generation
    const SYSTEM_PROMPT = `
    You are an AI scheduling assistant that helps users plan their day efficiently.

    IMPORTANT: Respond ONLY in valid JSON format with these possible types:
    - {"type": "plan", "plan": "reasoning about schedule"}
    - {"type": "output", "output": {"tasks": [task details]}}

    Rules for schedule generation:
    - Consider existing commitments
    - Prioritize high-priority tasks
    - Allocate realistic time blocks
    - Include breaks
    - Optimize productivity
    - Factor in user's energy levels and context
    - Provide buffer time between tasks

    Output JSON Structure for Tasks:
    {
        "tasks": [
            {
                "name": "Task Name",
                "duration": minutes,
                "priority": "high/medium/low",
                "startTime": "HH:MM",
        
            }
        ]
    }

    Additional Constraints:
    - Ensure total task duration is reasonable
    - Respect user's natural energy rhythms
    - Consider potential interruptions or context switching
    - Suggest short breaks between intense tasks

    Example interaction demonstrating ideal response (each line should be a single JSON object i.e respond 1 json at a time. The response you give should be the prompt for the next step):
    {"type": "user", "user": "I have a test tomorrow of DSA, need to study OOPS, also i need to practice guitar for 1 hour for my upcoming show which is day after tomorrow"}
    {"type": "plan", "plan": "You should prioritize DSA preparation given the upcoming test. Allocate focused study time with short breaks. Include guitar practice after primary study session."}
    {"type": "output", "output": {"tasks":[{"name":"Study DSA/OOPS","duration":240,"priority":"high","startTime":"18:00"},{"name":"Short Break","duration":15,"priority":"low","startTime":"22:00"},{"name":"Practice Guitar","duration":60,"priority":"medium","startTime":"22:15"}]}}
}}
        


    `;

    try {
        // Initialize the chat model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        
        // Start the chat with system context
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT } as Part],
                }
            ],
        });

        const messages: any[] = [];
        const userMessage = {
            type: 'user',
            user: prompt,
        };
        messages.push(userMessage);
        let plan = ""

        while (true) {
            // Send the current message
            const result = await chat.sendMessage([
                { text: JSON.stringify(messages[messages.length - 1]) } as Part
            ]);
            const responseText =  result.response.text();
            
            // Clean and parse the response
            const cleanedResponse = responseText.trim()
                .replace(/^```json/, '')  // Remove Markdown JSON formatting
                .replace(/^```/, '')      // Remove any stray triple backticks
                .replace(/```$/, '')      // Remove trailing triple backticks
                .trim();

            console.log(cleanedResponse)

            try {
                const action: ScheduleAction = JSON.parse(cleanedResponse);
                console.log("successfully parsed")
                messages.push(action);
             

                // Handle different action types
                
                if (action.type === 'output') {
                    return {schedule:action.output , plan};
                } else if (action.type === 'action' && action.tasks) {
                    // Save the generated schedule
                    // const savedSchedule = await tools.SaveSchedule(action.tasks);
                    return action.tasks;
                }
                else if (action.type === 'plan'){
                    plan = action.plan ?? ""
                }
            } catch (parseError) {
                console.error('Parse error:', parseError);
                throw new Error('Failed to parse AI response');
            }
        }
    } catch (error) {
        console.error('Schedule generation error:', error);
        throw new Error('Failed to generate schedule');
    }
}


