"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, X } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

interface DeleteTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: TaskType | null;
}

export default function DeleteTaskDialog({ 
  isOpen, 
  onClose, 
  onSuccess, 
  task 
}: DeleteTaskDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!task) return;

    setIsDeleting(true);
    
    try {
      const response = await axios.delete(`/api/tasks/${task.id}`);
      
      if (response.data.success) {
        toast.success("Task deleted successfully!");
        onSuccess(); // Trigger refresh of tasks
        onClose();
      } else {
        toast.error(response.data.error || "Failed to delete task");
      }
      
    } catch (error: any) {
      console.error("Error deleting task:", error);
      
      if (error.response?.status === 404) {
        toast.error("Task not found");
      } else {
        toast.error("Failed to delete task. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Delete Task</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-zinc-400 hover:text-white"
            disabled={isDeleting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-red-800 bg-red-950/20 p-4">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">
                Are you sure you want to delete this task?
              </p>
              <p className="mt-1 text-xs text-red-300">
                This action cannot be undone. All subtasks will also be deleted.
              </p>
            </div>
          </div>

          {/* Task Details */}
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
            <h4 className="font-medium text-white">{task.title}</h4>
            <div className="mt-2 space-y-1 text-sm text-zinc-400">
              <p>
                <span className="font-medium">Start:</span> {dayjs(task.startTime).format('MMM D, YYYY h:mm A')}
              </p>
              <p>
                <span className="font-medium">Duration:</span> {task.duration} minutes
              </p>
              <p>
                <span className="font-medium">Priority:</span> 
                <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${
                  task.priority === 'HIGH' ? 'bg-red-900/50 text-red-300' :
                  task.priority === 'MEDIUM' ? 'bg-yellow-900/50 text-yellow-300' :
                  'bg-green-900/50 text-green-300'
                }`}>
                  {task.priority}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Task"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}