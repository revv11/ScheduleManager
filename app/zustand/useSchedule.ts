import {create } from 'zustand'





interface ConversationState{
    
    tasks: TaskType[];
    
    setTasks: (messages: TaskType[]) =>void;
    
}


const useSchedule = create<ConversationState>((set)=>({
    
    tasks : [],
    
    setTasks: (tasks)=>set({tasks: tasks}),
   
}))


export default useSchedule;