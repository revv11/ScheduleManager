import { Message } from '@/components/custom/Prompt';
import {create } from 'zustand'
import axios from 'axios';




interface ConversationState{
    messages: Message[];
    setMessages: (messages: Message[]) =>void;
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
    setMessages: (messages)=>set({messages: messages}),
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
}))


export default useSchedule;