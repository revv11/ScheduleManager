"use client";
import { useState, useMemo } from "react";
import { Clock, ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import useSchedule from "@/zustand/useSchedule"; // Import your Zustand store

// NOTE: These types should ideally live in a central `types.ts` file
type Priority = "HIGH" | "MEDIUM" | "LOW";


// A reusable badge component specific to the card's design
const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors: Record<Priority, string> = {
    HIGH: "bg-red-900/50 text-red-300 border-red-700/60 hover:bg-red-900/70",
    MEDIUM: "bg-amber-900/50 text-amber-300 border-amber-700/60 hover:bg-amber-900/70",
    LOW: "bg-green-900/50 text-green-300 border-green-700/60 hover:bg-green-900/70",
  };
  return (
    <Badge variant="outline" className={`text-xs ${colors[priority]}`}>
      {priority}
    </Badge>
  );
};

export default function AICard({ task }: { task: TaskType }) {
  // Local state for UI interactions like expanding the card and handling input fields
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");

  // Get the global subtask state and actions from your Zustand store
  const { subTasks, addSubTask, updateSubTask, removeSubTask } = useSchedule();

  // Filter the global subtask array to get only the subtasks for this specific card.
  // `useMemo` is used for optimization, preventing this filter from running on every re-render.
  const relevantSubtasks = useMemo(() => {
    return subTasks.filter((st) => st.taskId === task.id);
  }, [subTasks, task.id]);

  // Helper function to format the duration from minutes to a readable string
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr ${remainingMinutes > 0 ? `${remainingMinutes} min` : ""}`;
  };

  // Calculate start and end times using dayjs
  const startTime = dayjs(task.startTime);
  const endTime = startTime.add(task.duration, "minute");

  // --- Handler Functions ---
  // These functions call the actions from your Zustand store to modify the global state

  const handleAddSubtask = () => {
    if (newSubtask.trim() === "") return;
    addSubTask(newSubtask.trim(), task.id);
    setNewSubtask(""); // Clear the input field after adding
  };

  const toggleSubtask = (id: string, currentStatus: boolean) => {
    updateSubTask(id, !currentStatus);
  };

  const deleteSubtask = (id: string) => {
    removeSubTask(id);
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700">
      {/* --- Main Card Header --- */}
      <div className="flex cursor-pointer items-start justify-between" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex-1 space-y-1.5">
          <h3 className="font-semibold text-white">{task.title}</h3>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <div className="flex items-center">
              <Clock className="mr-1.5 h-4 w-4" />
              <span>{startTime.format("hh:mm A")} - {endTime.format("hh:mm A")}</span>
            </div>
            <PriorityBadge priority={task.priority ?? "MEDIUM"} />
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-zinc-300">{formatDuration(task.duration)}</span>
          <ChevronDown className={`mt-2 h-5 w-5 text-zinc-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* --- Expandable Subtask Section --- */}
      <div className={`overflow-hidden pt-2 transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <h4 className="mb-2 text-sm font-medium text-zinc-400">Sub-tasks</h4>
          <div className="space-y-2">
            {/* Map over the filtered subtasks to display them */}
            {relevantSubtasks.map((subtask) => (
              <div key={subtask.id} className="group flex items-center gap-3">
                <Checkbox
                  id={`subtask-${subtask.id}`}
                  checked={subtask.isCompleted}
                  onCheckedChange={() => toggleSubtask(subtask.id!, subtask.isCompleted)}
                />
                <label htmlFor={`subtask-${subtask.id}`} className={`flex-1 text-sm ${subtask.isCompleted ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                  {subtask.description}
                </label>
                <Button variant="ghost" size="icon" onClick={() => deleteSubtask(subtask.id!)} className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100">
                  <X className="h-4 w-4 text-zinc-500" />
                </Button>
              </div>
            ))}
          </div>

          {/* Input field and button for adding new subtasks */}
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
      </div>
    </div>
  );
}