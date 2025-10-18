"use server";

import { StateGraph, Annotation, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { db } from "./db";
import { ToolNode } from "@langchain/langgraph/prebuilt";

// --- 1. Enhanced State Definition ---

const GraphState = Annotation.Root({
  // Core message flow
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // User identification
  userId: Annotation<string>,
  
  // Explicit chat context - last 10 messages for context
  chatHistory: Annotation<Array<{
    role: 'USER' | 'AI';
    content: string;
    timestamp: string;
  }>>({
    reducer: (x, y) => y, // Replace with new history
    default: () => [],
  }),
  
  // Current user query being processed
  currentUserQuery: Annotation<string>({
    reducer: (x, y) => y, // Replace with latest query
    default: () => "",
  }),
  
  // LLM decision tracking
  llmDecision: Annotation<{
    reasoning: string;
    toolsToUse: string[];
    strategy: string;
  }>({
    reducer: (x, y) => y, // Replace with latest decision
    default: () => ({ reasoning: "", toolsToUse: [], strategy: "" }),
  }),
  
  // Context from previous interactions
  conversationContext: Annotation<string>({
    reducer: (x, y) => y, // Replace with latest context
    default: () => "",
  }),
});

// --- 2. Helper Functions for Conflict Detection ---

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  taskId?: string;
  title?: string;
}

function findTimeConflicts(tasks: TimeSlot[]): Array<{conflict: boolean, tasks: string[]}> {
  const conflicts: Array<{conflict: boolean, tasks: string[]}> = [];
  
  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const task1 = tasks[i];
      const task2 = tasks[j];
      
      // Check if tasks overlap
      const hasConflict = 
        (task1.startTime < task2.endTime && task1.endTime > task2.startTime);
      
      if (hasConflict) {
        conflicts.push({
          conflict: true,
          tasks: [task1.title || task1.taskId || '', task2.title || task2.taskId || '']
        });
      }
    }
  }
  
  return conflicts;
}

function findNextAvailableSlot(
  existingTasks: TimeSlot[],
  duration: number,
  preferredStart?: Date
): Date {
  // Get current time in IST
  const now = new Date();
  const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const startSearch = preferredStart && preferredStart > istNow ? preferredStart : istNow;
  
  // Sort existing tasks by start time
  const sortedTasks = existingTasks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  // Try the preferred start time first
  let candidateStart = new Date(startSearch);
  let candidateEnd = new Date(candidateStart.getTime() + duration * 60000);
  
  // Check if candidate slot conflicts with any existing task
  let hasConflict = true;
  let attempts = 0;
  const maxAttempts = 100;
  
  while (hasConflict && attempts < maxAttempts) {
    hasConflict = false;
    
    for (const task of sortedTasks) {
      if (candidateStart < task.endTime && candidateEnd > task.startTime) {
        // Conflict found, move to after this task
        candidateStart = new Date(task.endTime);
        candidateEnd = new Date(candidateStart.getTime() + duration * 60000);
        hasConflict = true;
        break;
      }
    }
    
    attempts++;
  }
  
  return candidateStart;
}

// --- 3. Simplified Tool Definitions ---

const tools = [
  {
    name: "get_all_tasks",
    description: "Retrieve all tasks and subtasks for the user. Call this to see current schedule before making any changes.",
    schema: {
      type: "object",
      properties: {},
    },
    func: async (args: any, config: { userId: string }) => {
      const tasks = await db.task.findMany({
        where: { userId: config.userId },
        include: { subTasks: true },
        orderBy: { startTime: "asc" },
      });

      return JSON.stringify({
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          duration: t.duration,
          priority: t.priority,
          startTime: t.startTime.toISOString(),
          endTime: new Date(t.startTime.getTime() + t.duration * 60000).toISOString(),
          subTasks: t.subTasks.map((st) => ({
            id: st.id,
            description: st.description,
            isCompleted: st.isCompleted,
          })),
        })),
        message: "Current schedule retrieved."
      });
    },
  },
  {
    name: "create_tasks",
    description: "Create new tasks in the schedule. You are responsible for analyzing existing schedule and choosing appropriate times to avoid conflicts. Set autoResolveConflicts=true to automatically adjust conflicting times. Each task needs title, duration (minutes), priority (HIGH/MEDIUM/LOW), and startTime (ISO string).",
    schema: {
      type: "object",
      properties: {
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              duration: { type: "number" },
              priority: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
              startTime: { type: "string" },
            },
            required: ["title", "duration", "priority", "startTime"],
          },
        },
        clearExisting: {
          type: "boolean",
          description: "If true, delete all existing tasks before creating new ones",
        },
        autoResolveConflicts: {
          type: "boolean",
          description: "If true, automatically adjust times to avoid conflicts. Recommended to set this to true.",
        },
      },
      required: ["tasks"],
    },
    func: async (
      args: {
        tasks: Array<{
          title: string;
          duration: number;
          priority: "HIGH" | "MEDIUM" | "LOW";
          startTime: string;
        }>;
        clearExisting?: boolean;
        autoResolveConflicts?: boolean;
      },
      config: { userId: string }
    ) => {
      try {
        let tasksToCreate = args.tasks;

        if (!args.clearExisting && args.autoResolveConflicts) {
          // Load existing tasks
          const existingTasks = await db.task.findMany({
            where: { userId: config.userId },
          });

          const existingSlots: TimeSlot[] = existingTasks.map((t) => ({
            startTime: t.startTime,
            endTime: new Date(t.startTime.getTime() + t.duration * 60000),
            taskId: t.id,
            title: t.title,
          }));

          // Adjust times to avoid conflicts
          tasksToCreate = args.tasks.map((task) => {
            const proposedStart = new Date(task.startTime);
            const adjustedStart = findNextAvailableSlot(
              existingSlots,
              task.duration,
              proposedStart
            );

            // Add this slot to existing for next iteration
            existingSlots.push({
              startTime: adjustedStart,
              endTime: new Date(adjustedStart.getTime() + task.duration * 60000),
              title: task.title,
            });

            return {
              ...task,
              startTime: adjustedStart.toISOString(),
            };
          });
        }

        if (args.clearExisting) {
          await db.task.deleteMany({ where: { userId: config.userId } });
        }

        const created = [];
        const createdDetails = [];
        
        for (const task of tasksToCreate) {
          const newTask = await db.task.create({
            data: {
              title: task.title,
              duration: task.duration,
              priority: task.priority,
              startTime: new Date(task.startTime),
              userId: config.userId,
            },
          });
          created.push(newTask.id);
          createdDetails.push({
            id: newTask.id,
            title: newTask.title,
            startTime: newTask.startTime.toISOString(),
            duration: newTask.duration,
          });
        }

        return JSON.stringify({
          success: true,
          created: created.length,
          taskIds: created,
          tasks: createdDetails,
          message: args.autoResolveConflicts 
            ? "Tasks created with automatic conflict resolution"
            : "Tasks created successfully",
        });
      } catch (error) {
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  },
  {
    name: "update_task",
    description: "Update an existing task. Provide the task ID and fields to update (title, duration, priority, startTime).",
    schema: {
      type: "object",
      properties: {
        taskId: { type: "string" },
        title: { type: "string" },
        duration: { type: "number" },
        priority: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
        startTime: { type: "string" },
      },
      required: ["taskId"],
    },
    func: async (
      args: {
        taskId: string;
        title?: string;
        duration?: number;
        priority?: "HIGH" | "MEDIUM" | "LOW";
        startTime?: string;
      },
      config: { userId: string }
    ) => {
      try {
        const updateData: any = {};
        if (args.title) updateData.title = args.title;
        if (args.duration) updateData.duration = args.duration;
        if (args.priority) updateData.priority = args.priority;
        if (args.startTime) updateData.startTime = new Date(args.startTime);

        const updated = await db.task.update({
          where: {
            id: args.taskId,
            userId: config.userId, // Security: ensure user owns this task
          },
          data: updateData,
        });

        return JSON.stringify({
          success: true,
          taskId: updated.id,
          updated: updateData,
        });
      } catch (error) {
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  },
  {
    name: "delete_task",
    description: "Delete a task by ID. This will also delete all associated subtasks.",
    schema: {
      type: "object",
      properties: {
        taskId: { type: "string" },
      },
      required: ["taskId"],
    },
    func: async (args: { taskId: string }, config: { userId: string }) => {
      try {
        await db.task.delete({
          where: {
            id: args.taskId,
            userId: config.userId,
          },
        });

        return JSON.stringify({ success: true, deletedTaskId: args.taskId });
      } catch (error) {
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  },
  {
    name: "create_subtasks",
    description: "Create subtasks for specific task(s). Provide task IDs and generate appropriate subtasks for each.",
    schema: {
      type: "object",
      properties: {
        taskIds: {
          type: "array",
          items: { type: "string" },
          description: "Array of task IDs to create subtasks for",
        },
        replaceExisting: {
          type: "boolean",
          description: "If true, delete existing subtasks before creating new ones",
        },
      },
      required: ["taskIds"],
    },
    func: async (
      args: { taskIds: string[]; replaceExisting?: boolean },
      config: { userId: string }
    ) => {
      try {
        const tasks = await db.task.findMany({
          where: {
            id: { in: args.taskIds },
            userId: config.userId,
          },
        });

        if (tasks.length === 0) {
          return JSON.stringify({ success: false, error: "No tasks found" });
        }

        // Use LLM to generate subtasks
        const model = new ChatGoogleGenerativeAI({ model: "gemini-2.5-flash" });
        const createdSubTasks = [];

        for (const task of tasks) {
          if (args.replaceExisting) {
            await db.subTask.deleteMany({ where: { taskId: task.id } });
          }

          const prompt = `Break down this task into 3-5 specific, actionable subtasks:

Task: "${task.title}"
Duration: ${task.duration} minutes

Respond with JSON:
\`\`\`json
{
  "subtasks": [
    "First specific action",
    "Second specific action",
    "Third specific action"
  ]
}
\`\`\``;

          const result = await model.invoke(prompt);
          const match = result.content.toString().match(/```json\s*([\s\S]*?)\s*```/);
          
          if (match) {
            const parsed = JSON.parse(match[1]);
            for (const desc of parsed.subtasks) {
              const subTask = await db.subTask.create({
                data: {
                  description: desc,
                  taskId: task.id,
                  isCompleted: false,
                },
              });
              createdSubTasks.push(subTask.id);
            }
          }
        }

        return JSON.stringify({
          success: true,
          created: createdSubTasks.length,
          subTaskIds: createdSubTasks,
        });
      } catch (error) {
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  },
  {
    name: "update_subtask",
    description: "Update a subtask's description or completion status.",
    schema: {
      type: "object",
      properties: {
        subTaskId: { type: "string" },
        description: { type: "string" },
        isCompleted: { type: "boolean" },
      },
      required: ["subTaskId"],
    },
    func: async (
      args: {
        subTaskId: string;
        description?: string;
        isCompleted?: boolean;
      },
      config: { userId: string }
    ) => {
      try {
        const updateData: any = {};
        if (args.description) updateData.description = args.description;
        if (args.isCompleted !== undefined) updateData.isCompleted = args.isCompleted;

        // Verify ownership through task
        const subTask = await db.subTask.findFirst({
          where: { id: args.subTaskId },
          include: { task: true },
        });

        if (!subTask || subTask.task.userId !== config.userId) {
          return JSON.stringify({ success: false, error: "Subtask not found" });
        }

        const updated = await db.subTask.update({
          where: { id: args.subTaskId },
          data: updateData,
        });

        return JSON.stringify({
          success: true,
          subTaskId: updated.id,
          updated: updateData,
        });
      } catch (error) {
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  },
  {
    name: "delete_subtask",
    description: "Delete a subtask by ID.",
    schema: {
      type: "object",
      properties: {
        subTaskId: { type: "string" },
      },
      required: ["subTaskId"],
    },
    func: async (args: { subTaskId: string }, config: { userId: string }) => {
      try {
        // Verify ownership
        const subTask = await db.subTask.findFirst({
          where: { id: args.subTaskId },
          include: { task: true },
        });

        if (!subTask || subTask.task.userId !== config.userId) {
          return JSON.stringify({ success: false, error: "Subtask not found" });
        }

        await db.subTask.delete({ where: { id: args.subTaskId } });
        return JSON.stringify({ success: true, deletedSubTaskId: args.subTaskId });
      } catch (error) {
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  },
];

// --- 3. Convert tools to LangChain format ---

function createLangChainTools(userId: string) {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    schema: tool.schema,
    func: async (input: any) => tool.func(input, { userId }),
  }));
}

// --- 4. Agent Node with Enhanced Context ---

async function agentNode(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("\n=== AGENT THINKING ===");
  console.log(`📝 Current Query: ${state.currentUserQuery}`);
  console.log(`🧠 Chat History: ${state.chatHistory.length} messages`);
  console.log(`💭 Previous Context: ${state.conversationContext.substring(0, 100)}...`);
  
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
  }).bindTools(createLangChainTools(state.userId));

  // Build enhanced context from chat history
  const contextSummary = state.chatHistory.length > 0 
    ? `\n\nCONVERSATION HISTORY (Last ${state.chatHistory.length} messages):\n` +
      state.chatHistory.map((msg, i) => 
        `${i + 1}. ${msg.role}: ${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}`
      ).join('\n')
    : '\n\nNo previous conversation history.';

  const systemMessage = new AIMessage(
    `You are a helpful scheduling assistant. You have access to tools to manage tasks and subtasks.

Current date/time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST (Indian Standard Time)
Current ISO time: ${new Date().toISOString()}

CURRENT USER QUERY: "${state.currentUserQuery}"

CONVERSATION CONTEXT: ${state.conversationContext || 'This is a new conversation.'}
${contextSummary}

CRITICAL SCHEDULING RULES:
1. Call get_all_tasks to see existing schedule before making changes
2. When creating tasks, YOU are responsible for analyzing existing schedule and avoiding time conflicts
3. Use your intelligence to choose appropriate times that don't overlap with existing tasks
4. ALWAYS set autoResolveConflicts=true when creating tasks - this provides automatic conflict resolution as backup
5. Think about logical scheduling - don't put tasks too close together, allow reasonable breaks

TIMEZONE CONTEXT:
- All times should be interpreted and displayed in IST (Indian Standard Time)
- When users mention times like "9 AM" or "tomorrow", assume IST timezone
- Display times in a user-friendly IST format when possible

DECISION MAKING PROCESS:
1. Analyze the current query in context of conversation history
2. Look at existing schedule to understand current commitments
3. Use your reasoning to choose optimal times that avoid conflicts
4. Create tasks with intelligent time allocation
5. Be aware of user preferences from previous interactions

Simplified workflow for creating tasks:
Step 1: get_all_tasks (see what exists)
Step 2: Analyze schedule and use your intelligence to choose conflict-free times
Step 3: create_tasks with autoResolveConflicts=true (intelligent creation with automatic backup)

When a user asks to modify, update, delete, or view their schedule:
1. First use get_all_tasks to see the current state
2. Use your intelligence to analyze schedules and choose appropriate times
3. Use appropriate tools to make the requested changes
4. Always confirm what you did with specific times

Be conversational but efficient. Reference previous interactions when relevant. Use your reasoning skills to avoid time conflicts - you're smart enough to analyze schedules and make good decisions!`
  );

  const response = await model.invoke([systemMessage, ...state.messages]);

  // Extract LLM decision reasoning if available
  const llmDecision = {
    reasoning: `Processing query: "${state.currentUserQuery}" with ${state.chatHistory.length} previous messages for context`,
    toolsToUse: [], // Will be populated based on tool calls
    strategy: "Context-aware scheduling with conflict prevention"
  };

  return { 
    messages: [response],
    llmDecision: llmDecision
  };
}

// --- 5. Tool Execution Node with Decision Tracking ---

async function toolNode(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("\n=== EXECUTING TOOLS ===");

  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || typeof lastMessage.content !== 'object' || !('tool_calls' in lastMessage)) {
    return {};
  }

  const toolCalls = (lastMessage as any).tool_calls || [];
  const toolResults = [];
  const usedTools: string[] = [];

  for (const toolCall of toolCalls) {
    const tool = tools.find((t) => t.name === toolCall.name);
    if (tool) {
      console.log(`🔧 Calling: ${toolCall.name}`);
      usedTools.push(toolCall.name);
      const result = await tool.func(toolCall.args, { userId: state.userId });
      
      // Create proper ToolMessage for each tool call
      const toolMessage = new ToolMessage({
        content: result,
        tool_call_id: toolCall.id,
      });
      
      toolResults.push(toolMessage);
    }
  }

  // Update LLM decision with actually used tools
  const updatedLlmDecision = {
    ...state.llmDecision,
    toolsToUse: usedTools,
    reasoning: state.llmDecision.reasoning + ` | Used tools: ${usedTools.join(', ')}`
  };

  console.log(`📊 Tools executed: ${usedTools.join(', ')}`);

  return { 
    messages: toolResults,
    llmDecision: updatedLlmDecision
  };
}

// --- 6. Router ---

function shouldContinue(state: typeof GraphState.State): "tools" | "__end__" {
  const lastMessage = state.messages[state.messages.length - 1];
  
  // If the last message has tool calls, continue to tool execution
  if (lastMessage && typeof lastMessage.content === 'object' && 'tool_calls' in lastMessage) {
    const toolCalls = (lastMessage as any).tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      console.log("→ TOOLS: Agent requested tool execution");
      return "tools";
    }
  }
  
  console.log("→ END: Agent finished");
  return "__end__";
}

// --- 7. Build Graph ---

const workflow = new StateGraph(GraphState);

workflow
  .addNode("agent", agentNode)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent"); // After tools, go back to agent

const app = workflow.compile();

// --- 8. Main Entry Point with Enhanced State Management ---

export async function AIScheduleGenerator(userInput: string, userId: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`USER: ${userInput}`);
  console.log("=".repeat(60));

  // Load chat history from database
  const chats = await db.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 10, // Last 10 messages for context
  });

  // Build chat history for context
  const chatHistory = chats.map((msg) => ({
    role: msg.role as 'USER' | 'AI',
    content: msg.content,
    timestamp: msg.createdAt.toISOString(),
  }));

  // Build conversation context summary
  const conversationContext = chatHistory.length > 0
    ? `Previous conversation covered: ${chatHistory
        .map(msg => msg.content.substring(0, 50))
        .join(' | ')}`
    : "New conversation starting.";

  // Convert to LangChain message format for processing
  const langChainHistory = chats.map((msg) =>
    msg.role === "USER"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );

  // Initialize enhanced state
  const initialState: typeof GraphState.State = {
    messages: [...langChainHistory, new HumanMessage(userInput)],
    userId,
    chatHistory,
    currentUserQuery: userInput,
    llmDecision: {
      reasoning: "",
      toolsToUse: [],
      strategy: ""
    },
    conversationContext,
  };

  console.log(`📚 Context: ${chatHistory.length} previous messages loaded`);
  console.log(`🎯 Query: "${userInput}"`);

  const result = await app.invoke(initialState, {
    recursionLimit: 10,
  });

  // Extract final AI response
  const lastMessage = result.messages[result.messages.length - 1];
  const aiResponse =
    typeof lastMessage.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);

  // Log final decision for debugging
  console.log(`🧠 Final Decision: ${result.llmDecision?.reasoning || 'No decision logged'}`);
  console.log(`🛠️  Tools Used: ${result.llmDecision?.toolsToUse?.join(', ') || 'None'}`);

  return {
    description: aiResponse,
    tasks: await db.task.findMany({ where: { userId } }),
    subTasks: await db.subTask.findMany({
      where: { task: { userId } },  
    }),
  };
}