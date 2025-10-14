"use client";
import { useRef, useEffect } from "react";
import useSchedule from "@/zustand/useSchedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListPlus } from "lucide-react";
import AICard from "./AICard"; // Adjust the path if necessary

function AIRec() {
  const { tasks, setTasks } = useSchedule();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <Card className="flex h-full flex-col border-zinc-800 bg-zinc-950">
        <CardHeader className="border-b border-zinc-800 pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <ListPlus className="h-12 w-12 text-zinc-600" />
          <div className="space-y-1">
            <h3 className="font-semibold text-white">No tasks yet!</h3>
            <p className="text-sm text-zinc-400">
              Chat with the AI assistant to build your schedule.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col border-zinc-800 bg-zinc-950">
      <CardHeader className="border-b border-zinc-800 pb-3">
        <CardTitle className="text-lg font-semibold text-white">
          AI Recommendations
        </CardTitle>
      </CardHeader>

      {/* 1. Removed 'overflow-y-auto' and added 'overflow-hidden' as a safeguard */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        {/* 2. Removed hardcoded height and used h-full to fill the parent CardContent */}
        <ScrollArea className="h-[calc(100vh-200px)] w-full p-4 ">
          <div className="space-y-3">
            {tasks.map((task) => (
              <AICard key={task.id} task={task} />
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default AIRec;