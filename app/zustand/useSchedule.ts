
import {create } from 'zustand'
import axios from 'axios';




interface ConversationState{
    messages: Message[];
    setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) =>void;
    tasks: TaskType[];
    setTasks: (messages: TaskType[]) =>void;
    loading: boolean;
    setLoading: (loading: boolean) =>void;
    fetchTasks: () =>void;
    fetchMessages: () =>void;
    msgLoading: boolean;
    setMsgLoading: (msgLoading: boolean) =>void;        
    taskLoading: boolean;
    setTaskLoading: (taskLoading: boolean) =>void;
    taskError: string | null;
    setTaskError: (taskError: string | null) =>void;
    msgError: string | null;
    setMsgError: (msgError: string | null) =>void;
    subTasks: SubTaskType[];
    setSubTasks: (subtasks: SubTaskType[]) => void;
    fetchSubTasks: () => void;
    subTaskLoading: boolean;
    setSubTaskLoading: (loading: boolean) => void;
    subTaskError: string | null;
    setSubTaskError: (error: string | null) => void;
    // --- SUBTASK FUNCTIONS ---
    addSubTask: (text: string, taskId: string) => void;
    updateSubTask: (id: string, isCompleted: boolean) => void;
    removeSubTask: (id: string) => void;
    // --- LANGGRAPH INTEGRATION ---
    updateFromLangGraphResponse: (aiResponse: any) => void;
}


const useSchedule = create<ConversationState>((set)=>({
    taskError: null,
    setTaskError: (taskError)=>set({taskError: taskError}),
    msgError: null,
    setMsgError: (msgError)=>set({msgError: msgError}),
    msgLoading: true,
    setMsgLoading: (msgLoading)=>set({msgLoading: msgLoading}),
    taskLoading: true,
    setTaskLoading: (taskLoading)=>set({taskLoading: taskLoading}),
    tasks : [],
    messages: [],
    setMessages: (messages) => set((state) => ({
        messages: typeof messages === 'function' ? messages(state.messages) : messages
    })),
    setTasks: (tasks)=>set({tasks: tasks.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())}),
    loading: false,
    setLoading: (loading)=>set({loading: loading}),
    fetchTasks: async ()=>{
        set({taskLoading: true})
        try{
            const res = await axios.get('/api/tasks')
            if(res.data.success){
                set({tasks: res.data.tasks as TaskType[]})
                set({taskLoading: false})
            }
            else{
                set({taskError: res.data.error as string})
                set({taskLoading: false})
            }
        }
        catch(e:any){
            set({taskError: e.message as string})
            set({taskLoading: false})
        }
       
    },
    fetchMessages: async ()=>{
        set({msgLoading: true})
        try{
            const res = await axios.get('/api/messages')
            if(res.data.success){
                set({messages: res.data.messages as Message[]})
                set({msgLoading: false})
            }
            else{
                set({msgError: res.data.error as string})
                set({msgLoading: false})
            }
        }
        catch(e:any){
            set({msgError: e.message as string})
            set({msgLoading: false})
        }
    },

    subTasks: [],
    setSubTasks: (subTasks) => set({ subTasks: subTasks }),
    subTaskLoading: false,
    setSubTaskLoading: (subTaskLoading) => set({ subTaskLoading }),
    subTaskError: null,
    setSubTaskError: (subTaskError) => set({ subTaskError }),

    fetchSubTasks: async () => {
        set({ subTaskLoading: true });
        try {
            const res = await axios.get('/api/subtasks');
            if (res.data.success) {
                set({ subTasks: res.data.subTasks as SubTaskType[] });
                set({ subTaskLoading: false });
            } else {
                set({ subTaskError: res.data.error as string });
                set({ subTaskLoading: false });
            }
        } catch (e: any) {
            set({ subTaskError: e.message as string });
            set({ subTaskLoading: false });
        }
    },

    // --- CLIENT-SIDE ONLY SUBTASK LOGIC ---

    addSubTask: (text, taskId) => {
        const newSubTask: SubTaskType = {
        id: crypto.randomUUID(), // Generate a unique ID on the front end
        description: text, // Changed from 'text' to 'description' to match database schema
        taskId,
        isCompleted: false,
        };
        set((state) => ({
        subTasks: [...state.subTasks, newSubTask],
        }));
    },

    updateSubTask: (id, isCompleted) => {
        set((state) => ({
        subTasks: state.subTasks.map((st) =>
            st.id === id ? { ...st, isCompleted } : st
        ),
        }));
    },

    removeSubTask: (id) => {
        set((state) => ({
        subTasks: state.subTasks.filter((st) => st.id !== id),
        }));
    },

    // --- LANGGRAPH INTEGRATION HELPER ---
    updateFromLangGraphResponse: (aiResponse: any) => {
        if (aiResponse?.tasksInSchedule) {
            set({ tasks: aiResponse.tasksInSchedule.sort((a: TaskType, b: TaskType) => 
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) });
        }
        if (aiResponse?.subTasksInSchedule) {
            set({ subTasks: aiResponse.subTasksInSchedule });
        }
    },
}))


export default useSchedule;