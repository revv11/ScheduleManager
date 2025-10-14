"use client";
import { useState, useEffect, useMemo } from "react";
import useSchedule from "@/zustand/useSchedule"; // 1. Import your Zustand store
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, BarChart3, Settings, Download, Plus, X } from "lucide-react";
import ClockT from "./Clock";
import ProgUpdate from "./ProgUpdate";

// Assuming TaskType is defined globally or imported


function Progress() {
  // 2. Get tasks and subtask logic from the Zustand store
  const { tasks, subTasks, addSubTask, updateSubTask, removeSubTask } = useSchedule();
  
  // State to hold the currently active task and the input for a new subtask
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [newSubtask, setNewSubtask] = useState("");

  // 3. Effect to find the currently active task
  // This runs every second to keep the active task up-to-date
  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      const currentTask = tasks.find(task => {
        const startTime = dayjs(task.startTime);
        const endTime = startTime.add(task.duration, 'minute');
        return now.isBetween(startTime, endTime);
      });
      setActiveTask(currentTask || null);
    }, 1000); // Check every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, [tasks]);

  // 4. Filter subtasks for the active task, using useMemo for optimization
  const relevantSubtasks = useMemo(() => {
    if (!activeTask) return [];
    return subTasks.filter(st => st.taskId === activeTask.id);
  }, [subTasks, activeTask]);

  // 5. Handlers to call Zustand actions for the active task's subtasks
  const handleAddSubtask = () => {
    if (newSubtask.trim() === "" || !activeTask) return;
    addSubTask(newSubtask.trim(), activeTask.id);
    setNewSubtask("");
  };

  const toggleSubtask = (id: string, currentStatus: boolean) => {
    updateSubTask(id, !currentStatus);
  };

  const deleteSubtask = (id: string) => {
    removeSubTask(id);
  };

  return (
    <Card className="flex h-full flex-col border-zinc-800 bg-zinc-950">
      <CardHeader className="border-b border-zinc-800 pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold text-white">Current Progress</span>
          <div><ClockT /></div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <ProgUpdate />
          
          {/* 6. Sub-task section - replaces "Quick Actions" */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
              {activeTask ? `Sub-tasks for "${activeTask.title}"` : "No Active Task"}
            </h3>
            
            {/* Only show the subtask manager if there is an active task */}
            {activeTask ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <div className="space-y-2">
                  {relevantSubtasks.map((subtask) => (
                    <div key={subtask.id} className="group flex items-center gap-3">
                      <Checkbox
                        id={`progress-subtask-${subtask.id}`}
                        checked={subtask.isCompleted}
                        onCheckedChange={() => toggleSubtask(subtask.id!, subtask.isCompleted)}
                      />
                      <label htmlFor={`progress-subtask-${subtask.id}`} className={`flex-1 text-sm ${subtask.isCompleted ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                        {subtask.description}
                      </label>
                      <Button variant="ghost" size="icon" onClick={() => deleteSubtask(subtask.id!)} className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100">
                        <X className="h-4 w-4 text-zinc-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a new sub-task..."
                    className="h-9 bg-zinc-800"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <Button size="sm" onClick={handleAddSubtask} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-zinc-800 text-sm text-zinc-500">
                Sub-tasks will appear here for the active task.
              </div>
            )}
          </div>
{/* 
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
              Daily Summary
            </h3>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 min-h-[80px]">
              Summary Items can go here
            </div>
          </div> 

           */}
        </div>
      </CardContent>
    </Card>
  );
}

export default Progress;