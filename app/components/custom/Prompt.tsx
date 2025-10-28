"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare, Loader2Icon } from "lucide-react"
import userPrompt from "@/actions/userPrompt";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Role } from "@prisma/client";
import useSchedule from "@/zustand/useSchedule";
import { useSession } from "next-auth/react"
import DashboardCard from "./DashboardCard"

function Prompt() {
    const session = useSession()
    const {
        messages, 
        setMessages, 
        loading, 
        setLoading, 
        msgError, 
        updateFromLangGraphResponse,
        fetchMessages,
        hasMoreMessages,
        loadingMore
    } = useSchedule()
    const [input, setInput] = useState("");
    const [isPending, startTransition] = useTransition() 
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const previousMessageCount = useRef(0);

   
    // Scroll to bottom whenever new messages are added (but not for pagination)
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Handle scroll event for pagination
    const handleScroll = (event: any) => {
        const target = event.target;
        if (target.scrollTop === 0 && hasMoreMessages && !loadingMore) {
            // Store current scroll height before loading more messages
            const scrollContainer = target;
            const previousScrollHeight = scrollContainer.scrollHeight;
            
            // Disable auto-scroll when loading older messages
            setShouldAutoScroll(false);
            
            // Load older messages and maintain scroll position
            fetchMessages(true).then(() => {
                // After new messages are loaded, adjust scroll to maintain position
                const newScrollHeight = scrollContainer.scrollHeight;
                const heightDifference = newScrollHeight - previousScrollHeight;
                scrollContainer.scrollTop = heightDifference;
            });
        }
    };

    // Scroll to bottom logic
    useEffect(() => {
        const currentCount = messages.length;
        const previousCount = previousMessageCount.current;

        // Scroll to bottom only in these cases:
        // 1. Initial load (first time getting messages)
        // 2. New messages added (when shouldAutoScroll is true)
        
        if (currentCount > 0 && previousCount === 0) {
            // Initial load
            setTimeout(scrollToBottom, 100);
        } else if (currentCount > previousCount && shouldAutoScroll && !loadingMore) {
            // New messages added by user or AI (not from pagination)
            setTimeout(scrollToBottom, 100);
        }

        // Update the previous count
        previousMessageCount.current = currentCount;
    }, [messages, shouldAutoScroll, loadingMore]);

    // Re-enable auto-scroll after pagination is complete
    useEffect(() => {
        if (!loadingMore && !shouldAutoScroll) {
            // Re-enable auto-scroll after a short delay
            setTimeout(() => setShouldAutoScroll(true), 500);
        }
    }, [loadingMore, shouldAutoScroll]);

    // Handle form submission
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!input.trim()) return;

        const q = input;
        setInput("");
        
        // Add user message and temporary AI "thinking" message
        const userMessage = {
            role: Role.USER,
            content: q,
            createdAt: new Date(),
        };
        
        const thinkingMessage = {
            role: Role.AI,
            content: "Thinking...",
            createdAt: new Date()
        };
        
        setMessages((prev) => [...prev, userMessage, thinkingMessage]);

        try {
            startTransition(async () => {
                setLoading(true);
                const res = await userPrompt(q);
                setLoading(false);
                
                if (res.error) {
                    setMessages((prev) => [
                        ...prev.slice(0, -1),
                        {
                            role: Role.AI,
                            content: res.message.content,
                            createdAt: new Date()
                        }
                    ]);
                } else {
                    if (res.aiResponse) {
                        updateFromLangGraphResponse(res.aiResponse);
                    }
                    
                    setMessages((prev) => [
                        ...prev.slice(0, -1),
                        {
                            role: Role.AI,
                            content: res.message.content,
                            createdAt: new Date()
                        }
                    ]);
                }
            });
        } catch (e) {
            console.log(e);
            setMessages((prev) => [
                ...prev.slice(0, -1),
                {
                    role: Role.AI,
                    content: "Sorry, something went wrong. Please try again.",
                    createdAt: new Date()
                }
            ]);
        }
    }

    return (
        <DashboardCard
          title="AI Assistant"
          icon={<MessageSquare className="h-5 w-5 text-purple-400" />}
          contentClassName="flex flex-col overflow-hidden p-0"
        >
            {/* Messages Area - with overflow scroll to contain content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4" onScroll={handleScroll}>
              <div className="space-y-4">
              {msgError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-red-400">
                    <p className="text-sm">Error loading messages: {msgError}</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-sm text-zinc-400 space-y-3">
                  <h2 className="text-lg font-semibold text-white">Welcome to Your AI Schedule Assistant</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Create Your Schedule</strong> – Start by adding tasks with a title, duration, and start time.</li>
                    <li><strong>Use AI Recommendations</strong> – Click &quot;AI Recommendations&quot; to get a smart schedule based on your goals.</li>
                    <li><strong>Chat with the Assistant</strong> – Try asking: <br /><code>&quot;Suggest a study plan for today.&quot;</code> or <code>&quot;Add a 30-minute walk.&quot;</code></li>
                    <li><strong>Track Your Progress</strong> – The Current Task panel updates in real time!</li>
                  </ul>
                </div>
              ) : (
                <>
                  {/* Load More Indicator */}
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading older messages...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Has More Messages Indicator */}
                  {hasMoreMessages && !loadingMore && (
                    <div className="flex justify-center py-2">
                      <div className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
                        Scroll to top to load more
                      </div>
                    </div>
                  )}

                  {messages.map((message: any, index: number) => (
                    <div key={`msg-${index}`} className={`flex ${message.role === "AI" ? "justify-start" : "justify-end"}`}>
                      {message.role === "AI" && (
                        <div className="h-8 w-8 flex-shrink-0 mr-2">
                          <Avatar className="h-8 w-8 bg-purple-700">
                            <AvatarFallback className="bg-purple-700 text-purple-100">AI</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] break-words ${
                          message.role === "AI" ? "bg-zinc-800 text-zinc-100" : "bg-purple-600 text-white"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "USER" && (
                        <div className="h-8 w-8 flex-shrink-0 ml-2">
                          <Avatar className="h-8 w-8 border border-purple-500/20">
                            <AvatarImage src={session.data?.user?.image ?? ""} alt="User" />
                            <AvatarFallback className="bg-purple-900 text-purple-200"></AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </>
              )}
              </div>
            </div>

            {/* Input Area - fixed at bottom */}
            <div className="flex-shrink-0 border-t border-zinc-800 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    value={input}
                  onChange={(e)=>setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-purple-500"
                />
                <Button 
                  type="submit"
                  size="icon" 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isPending || loading}
                >
                  {isPending || loading ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
        </DashboardCard>
  );
}
export default Prompt;