
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
    fetchMessages: (loadOlder?: boolean) => Promise<void>;
    msgLoading: boolean;
    setMsgLoading: (msgLoading: boolean) =>void;        
    taskLoading: boolean;
    setTaskLoading: (taskLoading: boolean) =>void;
    taskError: string | null;
    setTaskError: (taskError: string | null) =>void;
    msgError: string | null;
    setMsgError: (msgError: string | null) =>void;
    // Pagination state
    currentPage: number;
    setCurrentPage: (page: number) => void;
    hasMoreMessages: boolean;
    setHasMoreMessages: (hasMore: boolean) => void;
    totalMessages: number;
    setTotalMessages: (total: number) => void;
    loadingMore: boolean;
    setLoadingMore: (loading: boolean) => void;
    subTasks: SubTaskType[];
    setSubTasks: (subtasks: SubTaskType[]) => void;
    fetchSubTasks: () => void;
    subTaskLoading: boolean;
    setSubTaskLoading: (loading: boolean) => void;
    subTaskError: string | null;
    setSubTaskError: (error: string | null) => void;
    // Global loading state (combination of tasks and subtasks)
    globalLoading: boolean;
    // --- TASK FUNCTIONS ---
    updateTask: (id: string, updates: Partial<TaskType>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    // --- SUBTASK FUNCTIONS ---
    addSubTask: (text: string, taskId: string) => Promise<void>;
    updateSubTask: (id: string, isCompleted: boolean) => Promise<void>;
    removeSubTask: (id: string) => Promise<void>;
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
    setTaskLoading: (taskLoading) => set((state) => ({
        taskLoading,
        globalLoading: taskLoading || state.subTaskLoading
    })),
    tasks : [],
    messages: [],
    setMessages: (messages) => set((state) => ({
        messages: typeof messages === 'function' ? messages(state.messages) : messages
    })),
    setTasks: (tasks)=>set({tasks: tasks.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())}),
    loading: false,
    setLoading: (loading)=>set({loading: loading}),
    // Pagination state
    currentPage: 1,
    setCurrentPage: (currentPage) => set({ currentPage }),
    hasMoreMessages: false,
    setHasMoreMessages: (hasMoreMessages) => set({ hasMoreMessages }),
    totalMessages: 0,
    setTotalMessages: (totalMessages) => set({ totalMessages }),
    loadingMore: false,
    setLoadingMore: (loadingMore) => set({ loadingMore }),
    fetchTasks: async ()=>{
        set((state) => ({ taskLoading: true, taskError: null, globalLoading: true || state.subTaskLoading }));
        try{
            const res = await axios.get('/api/tasks')
            if(res.data.success){
                set((state) => ({
                    tasks: res.data.tasks as TaskType[],
                    taskLoading: false,
                    taskError: null,
                    globalLoading: false || state.subTaskLoading
                }));
            }
            else{
                set((state) => ({
                    taskError: res.data.error as string,
                    taskLoading: false,
                    globalLoading: false || state.subTaskLoading
                }));
            }
        }
        catch(e:any){
            set((state) => ({
                taskError: e.message as string,
                taskLoading: false,
                globalLoading: false || state.subTaskLoading
            }));
        }
    },
    fetchMessages: async (loadOlder = false) => {
        if (loadOlder) {
            set({ loadingMore: true });
        } else {
            set({ msgLoading: true, msgError: null });
        }
        
        try {
            let url = '/api/messages?limit=10';
            
            // If loading older messages, get messages before the oldest current message
            if (loadOlder) {
                const currentState = useSchedule.getState();
                const oldestMessage = currentState.messages[0];
                if (oldestMessage) {
                    url += `&before=${oldestMessage.createdAt}`;
                }
            }
            
            const res = await axios.get(url);
            if (res.data.success) {
                const newMessages = res.data.messages as Message[];
                const { pagination } = res.data;
                
                if (loadOlder) {
                    // Prepend older messages to the beginning
                    set((state) => ({
                        messages: [...newMessages, ...state.messages],
                        loadingMore: false,
                        hasMoreMessages: pagination.hasMore,
                        totalMessages: pagination.totalCount
                    }));
                } else {
                    // Initial load - show latest messages at bottom
                    set({
                        messages: newMessages,
                        msgLoading: false,
                        msgError: null,
                        hasMoreMessages: pagination.hasMore,
                        totalMessages: pagination.totalCount
                    });
                }
            } else {
                set({ 
                    msgError: res.data.error as string,
                    msgLoading: false,
                    loadingMore: false
                });
            }
        } catch (e: any) {
            set({ 
                msgError: e.message as string,
                msgLoading: false,
                loadingMore: false
            });
        }
    },

    subTasks: [],
    setSubTasks: (subTasks) => set({ subTasks: subTasks }),
    subTaskLoading: false,
    setSubTaskLoading: (subTaskLoading) => set((state) => ({ 
        subTaskLoading,
        globalLoading: subTaskLoading || state.taskLoading 
    })),
    subTaskError: null,
    setSubTaskError: (subTaskError) => set({ subTaskError }),
    
    // Global loading state (computed from task and subtask loading)
    globalLoading: false,

    fetchSubTasks: async () => {
        set((state) => ({ 
            subTaskLoading: true,
            subTaskError: null,
            globalLoading: true || state.taskLoading 
        }));
        try {
            const res = await axios.get('/api/subtasks');
            if (res.data.success) {
                set((state) => ({ 
                    subTasks: res.data.subTasks as SubTaskType[],
                    subTaskLoading: false,
                    subTaskError: null,
                    globalLoading: false || state.taskLoading
                }));
            } else {
                set((state) => ({ 
                    subTaskError: res.data.error as string,
                    subTaskLoading: false,
                    globalLoading: false || state.taskLoading
                }));
            }
        } catch (e: any) {
            set((state) => ({ 
                subTaskError: e.message as string,
                subTaskLoading: false,
                globalLoading: false || state.taskLoading
            }));
        }
    },

    // --- API-INTEGRATED SUBTASK LOGIC ---

    addSubTask: async (text, taskId) => {
        // Generate a temporary ID for optimistic update
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const optimisticSubTask: SubTaskType = {
            id: tempId,
            description: text,
            taskId: taskId,
            isCompleted: false,
        };

        // Optimistically add to UI immediately
        set((state) => ({
            subTasks: [...state.subTasks, optimisticSubTask],
        }));

        try {
            const res = await axios.post('/api/subtasks', {
                description: text,
                taskId: taskId
            });
            
            if (res.data.success) {
                const newSubTask = res.data.subTask;
                // Replace temporary subtask with real one from backend
                set((state) => ({
                    subTasks: state.subTasks.map((st) =>
                        st.id === tempId ? newSubTask : st
                    ),
                    subTaskError: null,
                }));
            } else {
                // Remove optimistic subtask on error
                set((state) => ({
                    subTasks: state.subTasks.filter((st) => st.id !== tempId),
                    subTaskError: res.data.error,
                }));
            }
        } catch (error: any) {
            // Remove optimistic subtask on error
            set((state) => ({
                subTasks: state.subTasks.filter((st) => st.id !== tempId),
                subTaskError: error.message,
            }));
        }
    },

    updateSubTask: async (id, isCompleted) => {
        try {
            // Optimistically update UI first
            set((state) => ({
                subTasks: state.subTasks.map((st) =>
                    st.id === id ? { ...st, isCompleted } : st
                ),
            }));

            const res = await axios.patch(`/api/subtasks/${id}`, {
                isCompleted: isCompleted
            });

            if (!res.data.success) {
                // Revert on failure
                set((state) => ({
                    subTasks: state.subTasks.map((st) =>
                        st.id === id ? { ...st, isCompleted: !isCompleted } : st
                    ),
                    subTaskError: res.data.error
                }));
            }
        } catch (error: any) {
            // Revert on error
            set((state) => ({
                subTasks: state.subTasks.map((st) =>
                    st.id === id ? { ...st, isCompleted: !isCompleted } : st
                ),
                subTaskError: error.message
            }));
        }
    },

    removeSubTask: async (id) => {
        try {
            // Optimistically remove from UI first
            const originalSubTasks = useSchedule.getState().subTasks;
            set((state) => ({
                subTasks: state.subTasks.filter((st) => st.id !== id),
            }));

            const res = await axios.delete(`/api/subtasks/${id}`);

            if (!res.data.success) {
                // Revert on failure
                set({ 
                    subTasks: originalSubTasks,
                    subTaskError: res.data.error 
                });
            }
        } catch (error: any) {
            // Revert on error
            const originalSubTasks = useSchedule.getState().subTasks;
            set({ 
                subTasks: originalSubTasks,
                subTaskError: error.message 
            });
        }
    },

    // --- TASK CRUD OPERATIONS ---
    updateTask: async (id, updates) => {
        try {
            // Optimistically update UI first
            const originalTasks = useSchedule.getState().tasks;
            set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === id ? { ...task, ...updates } : task
                ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
            }));

            const res = await axios.patch(`/api/tasks/${id}`, updates);

            if (!res.data.success) {
                // Revert on failure
                set({ 
                    tasks: originalTasks,
                    taskError: res.data.error 
                });
            }
        } catch (error: any) {
            // Revert on error
            const originalTasks = useSchedule.getState().tasks;
            set({ 
                tasks: originalTasks,
                taskError: error.message 
            });
        }
    },

    deleteTask: async (id) => {
        try {
            // Optimistically remove from UI first
            const originalTasks = useSchedule.getState().tasks;
            set((state) => ({
                tasks: state.tasks.filter((task) => task.id !== id),
            }));

            const res = await axios.delete(`/api/tasks/${id}`);

            if (!res.data.success) {
                // Revert on failure
                set({ 
                    tasks: originalTasks,
                    taskError: res.data.error 
                });
            }
        } catch (error: any) {
            // Revert on error
            const originalTasks = useSchedule.getState().tasks;
            set({ 
                tasks: originalTasks,
                taskError: error.message 
            });
        }
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