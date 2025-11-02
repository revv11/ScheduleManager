"use client";
import { useState, useMemo } from "react";
import { Clock, ChevronDown, Plus, X, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import useSchedule from "@/zustand/useSchedule"; // Import your Zustand store
import ManualTaskForm from "./ManualTaskForm";
import DeleteTaskDialog from "./DeleteTaskDialog";

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
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get the global subtask state and actions from your Zustand store
  const { subTasks, addSubTask, updateSubTask, removeSubTask, fetchTasks } = useSchedule();

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

  const handleAddSubtask = async () => {
    if (newSubtask.trim() === "") return;
    setNewSubtask(""); // Clear the input field after adding
    await addSubTask(newSubtask.trim(), task.id);
  };

  const toggleSubtask = async (id: string, currentStatus: boolean) => {
    await updateSubTask(id, !currentStatus);
  };

  const deleteSubtask = async (id: string) => {
    await removeSubTask(id);
  };

  const handleTaskUpdate = () => {
    // Refresh tasks after update
    fetchTasks();
    setShowEditForm(false);
  };

  const handleTaskDelete = () => {
    // Refresh tasks after delete
    fetchTasks();
    setShowDeleteDialog(false);
  };

  return (
    <div 
      className="group rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 p-6 shadow-lg transition-all duration-200 hover:border-zinc-700 hover:shadow-xl hover:from-zinc-900/90 hover:to-zinc-900/60 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      
      {/* Task Title */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <h3 
            className="text-xl font-bold text-white hover:text-zinc-200 transition-colors leading-tight flex-1"
          >
            {task.title}
          </h3>
          <div className="flex items-center gap-2 ml-4">
            <PriorityBadge priority={task.priority ?? "MEDIUM"} />
            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditForm(true);
                }}
                className="h-8 w-8 text-zinc-500 hover:text-blue-400 hover:bg-blue-900/20 transition-colors"
                title="Edit task"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Time and Duration Info */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-300">
          <div className="flex items-center justify-center w-8 h-8 bg-zinc-800 rounded-lg">
            <Clock className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-sm font-medium">
              {startTime.format("h:mm A")} - {endTime.format("h:mm A")}
            </div>
            <div className="text-xs text-zinc-500">
              {startTime.format("MMM D, YYYY")}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-zinc-200">
              {formatDuration(task.duration)}
            </div>
            <div className="text-xs text-zinc-500">
              Duration
            </div>
          </div>
          <div className="h-10 w-10 flex items-center justify-center text-zinc-400 rounded-lg">
            <ChevronDown 
              className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </div>

      {/* Edit Task Form Modal */}
      <ManualTaskForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={handleTaskUpdate}
        task={task}
      />

      {/* Delete Task Dialog Modal */}
      <DeleteTaskDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onSuccess={handleTaskDelete}
        task={task}
      />

      {/* --- Expandable Subtask Section --- */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[700px] opacity-100 pb-2" : "max-h-0 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-6 pt-6 border-t border-zinc-700/30">
          {/* Subtask Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="text-base font-semibold text-zinc-200">Subtasks</h4>
              {relevantSubtasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-zinc-400">
                    {relevantSubtasks.filter(st => st.isCompleted).length} of {relevantSubtasks.length} completed
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Subtask List */}
          <div className="space-y-2">
            {relevantSubtasks.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-zinc-600" />
                </div>
                <p className="text-sm">No subtasks yet</p>
                <p className="text-xs text-zinc-600">Add one below to get started!</p>
              </div>
            ) : (
              relevantSubtasks.map((subtask, index) => (
                <div 
                  key={subtask.id} 
                  className="group flex items-center gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50 hover:bg-zinc-800/50 hover:border-zinc-600/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      id={`subtask-${subtask.id}`}
                      checked={subtask.isCompleted}
                      onCheckedChange={() => toggleSubtask(subtask.id!, subtask.isCompleted)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`subtask-${subtask.id}`} 
                        className={`block text-sm cursor-pointer transition-colors ${
                          subtask.isCompleted 
                            ? "text-zinc-500 line-through" 
                            : "text-zinc-200 hover:text-white"
                        }`}
                      >
                        {subtask.description}
                      </label>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteSubtask(subtask.id!)} 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200"
                    title="Delete subtask"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Add New Subtask */}
          <div className="mt-6">
            <div className="flex gap-3">
              <Input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a new subtask..."
                className="flex-1 h-11 bg-zinc-800/50 border-zinc-700/50 focus:border-purple-500/50 focus:bg-zinc-800/70 transition-all duration-200 text-zinc-200 placeholder:text-zinc-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
              />
              <Button 
                size="default" 
                onClick={handleAddSubtask} 
                className="h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-5 font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                disabled={!newSubtask.trim()}
              >
                <Plus className="mr-2 h-4 w-4" /> 
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}