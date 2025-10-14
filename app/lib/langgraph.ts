"use server";

import { StateGraph, Annotation, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { db } from "./db";
import { ToolNode } from "@langchain/langgraph/prebuilt";

// --- 1. Minimal State Definition ---

const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  userId: Annotation<string>,
});

// --- 2. Tool Definitions ---

const tools = [
  {
    name: "get_all_tasks",
    description: "Retrieve all tasks and subtasks for the user. Use this to see the current schedule before making any changes.",
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
          subTasks: t.subTasks.map((st) => ({
            id: st.id,
            description: st.description,
            isCompleted: st.isCompleted,
          })),
        })),
      });
    },
  },
  {
    name: "create_tasks",
    description: "Create new tasks in the schedule. Each task needs title, duration (minutes), priority (HIGH/MEDIUM/LOW), and startTime (ISO string).",
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
      },
      config: { userId: string }
    ) => {
      try {
        if (args.clearExisting) {
          await db.task.deleteMany({ where: { userId: config.userId } });
        }

        const created = [];
        for (const task of args.tasks) {
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
        }

        return JSON.stringify({
          success: true,
          created: created.length,
          taskIds: created,
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

// --- 4. Agent Node ---

async function agentNode(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("\n=== AGENT THINKING ===");
  
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
  }).bindTools(createLangChainTools(state.userId));

  const systemMessage = new AIMessage(
    `You are a helpful scheduling assistant. You have access to tools to manage tasks and subtasks.

Current date/time: ${new Date().toISOString()}

When a user asks to modify, update, delete, or view their schedule:
1. First use get_all_tasks to see the current state
2. Then use appropriate tools to make the requested changes
3. Always confirm what you did

Be conversational but efficient. Make changes confidently based on user requests.`
  );

  const response = await model.invoke([systemMessage, ...state.messages]);

  return { messages: [response] };
}

// --- 5. Tool Execution Node ---

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

  const toolMessages = [];
  
  for (const toolCall of toolCalls) {
    const tool = tools.find((t) => t.name === toolCall.name);
    if (tool) {
      console.log(`🔧 Calling: ${toolCall.name}`);
      const result = await tool.func(toolCall.args, { userId: state.userId });
      
      // Create proper ToolMessage
      const toolMessage = new ToolMessage({
        content: result,
        tool_call_id: toolCall.id,
      });
      
      toolMessages.push(toolMessage);
    }
  }

  return { messages: toolMessages };
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

// --- 8. Main Entry Point ---

export async function AIScheduleGenerator(userInput: string, userId: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`USER: ${userInput}`);
  console.log("=".repeat(60));

  // Load chat history
  const chats = await db.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  const chatHistory = chats.map((msg) =>
    msg.role === "USER"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );

  const initialState: typeof GraphState.State = {
    messages: [...chatHistory, new HumanMessage(userInput)],
    userId,
  };

  const result = await app.invoke(initialState, {
    recursionLimit: 10,
  });

  // Extract final AI response
  const lastMessage = result.messages[result.messages.length - 1];
  const aiResponse =
    typeof lastMessage.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);


  return {
    description: aiResponse,
    tasks: await db.task.findMany({ where: { userId } }),
    subTasks: await db.subTask.findMany({
      where: { task: { userId } },  
    }),
  };
}