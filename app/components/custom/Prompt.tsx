"use client"

import userPrompt from "@/actions/userPrompt";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2Icon } from "lucide-react";
import axios from "axios";
// import ChatMessage from "./ChatMessage";

// import { askQuestion } from "@/actions/askQuestion";
// import ChatMessage from "./ChatMessage";
import ChatMessage from "../custom/ChatMessage";
import { useSession } from "next-auth/react";


export type Message = {
  id? : string;
  role: "human" | "ai" | "placeholder";
  message: string,
  createdAt?: Date;
}

const custommessages = [
    {id: "abcedef", role: "human", message:"hello how are you im under the wotor", createdAt: "2025-04-11T22:40:37.197Z"},
    {id: "helloai", role: "ai", message : "hello im goooood", createdat: "2025-04-11T22:40:37.197Z"},

] 



function Prompt() {
    const session = useSession()
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPending, startTransition] = useTransition() 
    const bottomOfChatRef = useRef<HTMLDivElement>(null);
    
    // OPTIMISTIC UI UPDATE
    async function handleSubmit(e: FormEvent){
        e.preventDefault();

        const q = input;
        setInput("")
        setMessages((prev)=>[
        ...prev,
        {
            role: "human",
            message: q,
            createdAt: new Date(),
        },
        {
            role: "ai",
            message: "Thinking...",
            createdAt: new Date()
        }
        ])

        try{
            const res = await userPrompt(input)
            
            setMessages(prev => [
                ...prev.slice(0, -1),
                {
                  id: "helloai",
                  role: "ai",
                  message: res.message,
                }
              ]);
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
                    role: "ai",
                    message: "Ask me anything about the document!",
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