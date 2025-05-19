"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Clock, Calendar, Send, MessageSquare } from "lucide-react"
import userPrompt from "@/actions/userPrompt";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { FetchMessages } from "@/actions/FetchMessages";
import toast from "react-hot-toast"
// import ChatMessage from "./ChatMessage";
import axios from "axios"
// import { askQuestion } from "@/actions/askQuestion";
// import ChatMessage from "./ChatMessage";
import { Role } from "@prisma/client";
import useSchedule from "@/zustand/useSchedule";
import { refresh } from "@/lib/refresh"
import { useSession } from "next-auth/react"


export type Message = {
  id? : string;
  role: Role;
  content: string,
  createdAt?: Date;
}



function Prompt() {
    const session = useSession()
    const {tasks,setTasks} = useSchedule()
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPending, startTransition] = useTransition() 
    const bottomOfChatRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        async function run(){
          try{
            
            const res = await FetchMessages();
            console.log(res)
            if(res.success && res.messages.length>0){
                setMessages(res.messages)
                
               
            }

          }
          catch(e:any){
            
            console.log("database error",e.message)
            toast.error("Database Error")
          }
        }
        
        run()
    },[])
    
    // OPTIMISTIC UI UPDATE
    async function handleSubmit(e: FormEvent){
        e.preventDefault();

        const q = input;
        setInput("")
        setMessages((prev)=>[
        ...prev,
        {
            role: Role.USER,
            content: q,
            createdAt: new Date(),
        },
        {
            role: Role.AI,
            content: "Thinking...",
            createdAt: new Date()
        }
        ])

        try{
            startTransition(async ()=>{
                setLoading(true)
                const res = await userPrompt(input)
                setLoading(false)
                console.log(res)
                
                if(res.error){
                  setMessages(prev => [
                      ...prev.slice(0, -1),
                      {
                        
                        role: Role.AI,
                        content:  res.message.content 
                      }
                    ]);
    
                }
                else{
                    if(res.message.updated=== true){
                      //call a function to update tasks
                      const newtasks  = await refresh()
                      setTasks(newtasks.newSchedule)
                   
                    }
                    setMessages(prev => [
                        ...prev.slice(0, -1),
                        {
                          role: Role.AI,
                          content:  res.message.content
                        }
                      ]);
                }

            })
        }
        catch(e){
            console.log(e)
        }
    

    }

    useEffect(() => {
        bottomOfChatRef.current?.scrollIntoView({
        behavior: "smooth",
        });
    }, [messages]);


    


    return (
       

        <Card className="bg-zinc-950 border-zinc-800 md:col-span-1">
          <CardHeader className="border-b border-zinc-800 pb-3">
            <CardTitle className="flex items-center text-lg font-semibold text-white">
              <MessageSquare className="h-5 w-5 mr-2 text-purple-400" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-[calc(100vh-220px)]">
            {messages.length===0?
            <ScrollArea className="flex-1 p-4 h-[calc(100vh-300px)]">
              <div className="text-sm text-zinc-400 px-4 py-6 space-y-3">
                <h2 className="text-lg font-semibold text-white">Welcome to Your AI Schedule Assistant</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Create Your Schedule</strong> – Start by adding tasks with a title, duration, and start time.</li>
                  <li><strong>Use AI Recommendations</strong> – Click “AI Recommendations” to get a smart schedule based on your goals.</li>
                  <li><strong>Chat with the Assistant</strong> – Try asking: <br /><code>"Suggest a study plan for today."</code> or <code>"Add a 30-minute walk."</code></li>
                  <li><strong>Track Your Progress</strong> – The Current Task panel updates in real time!</li>
                </ul>
              </div>
            </ScrollArea>
           :
            <ScrollArea  className="flex-1 p-4 h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "AI" ? "justify-start" : "justify-end"}`}>
                    {message.role === "AI" && (
                      <div className="mr-2">
                        <Avatar className="h-8 w-8 bg-purple-700">
                          <AvatarFallback className="bg-purple-700 text-purple-100">AI</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "AI" ? "bg-zinc-800 text-zinc-100" : "bg-purple-600 text-white"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {message.role === "USER" && (
                      <div className="ml-2">
                        <Avatar className="h-8 w-8 border border-purple-500/20">
                          <AvatarImage src={session.data?.user?.image ?? ""} alt="User" />
                          <AvatarFallback className="bg-purple-900 text-purple-200"></AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                ))}
              <div ref={bottomOfChatRef}/>
              </div>
            </ScrollArea >
          }
            <div className="p-4 border-t border-zinc-800 mt-auto">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    value={input}
                  onChange={(e)=>setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-purple-500"
                />
                <Button  size="icon" className="bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
  );
}
export default Prompt;