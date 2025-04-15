"use client"

import userPrompt from "@/actions/userPrompt";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2Icon } from "lucide-react";
import { FetchMessages } from "@/actions/FetchMessages";
// import ChatMessage from "./ChatMessage";

// import { askQuestion } from "@/actions/askQuestion";
// import ChatMessage from "./ChatMessage";
import ChatMessage from "../custom/ChatMessage";
import { Role } from "@prisma/client";
import useSchedule from "@/zustand/useSchedule";


export type Message = {
  id? : string;
  role: Role;
  content: string,
  createdAt?: Date;
}



function Prompt() {
    const {setTasks} = useSchedule()
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPending, startTransition] = useTransition() 
    const bottomOfChatRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        async function run(){
            const res = await FetchMessages();
            console.log(res)
            if(res.success){
                setMessages(res.messages)
                const AImessages  = res.response.filter((chat)=> chat.role === Role.AI && JSON.parse(chat.content.toString()).output.updated === true)
                const lastSuggestion  = AImessages[AImessages.length - 1]
                setTasks(JSON.parse(lastSuggestion.content).output.tasks)
                
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
                setTasks(res.message.output.tasks)
                if(res.error){
                    setMessages(prev => [
                        ...prev.slice(0, -1),
                        {
                         
                          role: Role.AI,
                          content:  res.message 
                        }
                      ]);
    
                }
                else{
                    setMessages(prev => [
                        ...prev.slice(0, -1),
                        {
                          role: Role.AI,
                          content:  res.message.output.description 
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
        <div className="flex flex-col h-full overflow-y-scroll">
        {/* Chat contents */}
        <div className="flex-1 w-full">
            {/* chat messages... */}

            {loading ? (
            <div className="flex items-center justify-center">
                <Loader2Icon className="animate-spin h-20 w-20 text-indigo-600 mt-20" />
            </div>
            ) : (
            <div className="p-5">
                {messages.length === 0 && (
                <ChatMessage
                    key={"placeholder"}
                    message={{
                    role: Role.AI,
                    content: "Let's build a schedule",
                    createdAt: new Date(),
                    }}
                />
                )}

                {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
                ))}

                <div ref={bottomOfChatRef} />
            </div>
            )}
        </div>

        <form
            onSubmit={handleSubmit}
            className="flex sticky bottom-0 space-x-2 p-5 bg-indigo-600/75"
        >
            <Input
            placeholder="Ask a Question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            />

            <Button type="submit" className="border-2 bg-blue-900 text-indigo-200" disabled={!input || isPending}>
            {isPending ? (
                <Loader2Icon className="animate-spin text-indigo-600" />
            ) : (
                "Ask"
            )}
            </Button>
        </form>
        </div>
  );
}
export default Prompt;