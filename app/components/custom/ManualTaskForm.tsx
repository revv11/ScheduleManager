"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-hot-toast";
import { validateTaskForm } from "@/lib/taskConflicts";

interface ManualTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Changed from onAddTask to onSuccess
}

interface TaskFormData {
  title: string;
  startTime: string;
  duration: string;
}

export default function ManualTaskForm({ 
  isOpen, 
  onClose, 
  onSuccess
}: ManualTaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    startTime: "",
    duration: ""
  });
  const [conflictingTasks, setConflictingTasks] = useState<TaskType[]>([]);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Reset errors
    setFormError("");
    setConflictingTasks([]);
    setIsSubmitting(true);
    
    try {
      // Validate form
      const validation = validateTaskForm(formData.title, formData.startTime, formData.duration);
      if (!validation.isValid) {
        setFormError(validation.error);
        return;
      }
      
      const duration = parseInt(formData.duration);
      
      // Convert datetime-local format to ISO string
      const startDateTime = new Date(formData.startTime).toISOString();
      
      // Submit to API
      const response = await axios.post('/api/tasks', {
        title: formData.title,
        startTime: startDateTime,
        duration: duration,
        priority: "MEDIUM"
      });
      
      if (response.data.success) {
        toast.success("Task created successfully!");
        handleClose();
        onSuccess(); // Trigger refresh of tasks
      } else {
        setFormError(response.data.error || "Failed to create task");
      }
      
    } catch (error: any) {
      console.error("Error creating task:", error);
      
      if (error.response?.status === 409) {
        // Handle time conflicts
        const conflictData = error.response.data;
        setConflictingTasks(conflictData.conflictingTasks || []);
        setFormError(conflictData.error || "Time conflict detected");
      } else if (error.response?.status === 400) {
        // Handle validation errors
        const validationErrors = error.response.data.details;
        if (validationErrors && validationErrors.length > 0) {
          setFormError(validationErrors[0].message);
        } else {
          setFormError(error.response.data.error || "Validation failed");
        }
      } else {
        setFormError("Failed to create task. Please try again.");
        toast.error("Failed to create task");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: "", startTime: "", duration: "" });
    setFormError("");
    setConflictingTasks([]);
    onClose();
  };

  const updateFormData = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Add New Task</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="task-title" className="text-zinc-300">
              Task Title
            </Label>
            <Input
              id="task-title"
              type="text"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              placeholder="Enter task title..."
              className="mt-1 bg-zinc-800 border-zinc-700"
            />
          </div>

          <div>
            <Label htmlFor="start-time" className="text-zinc-300">
              Start Time
            </Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => updateFormData("startTime", e.target.value)}
              className="mt-1 bg-zinc-800 border-zinc-700"
            />
          </div>

          <div>
            <Label htmlFor="duration" className="text-zinc-300">
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => updateFormData("duration", e.target.value)}
              placeholder="Enter duration in minutes..."
              className="mt-1 bg-zinc-800 border-zinc-700"
            />
          </div>

          {/* Error Message */}
          {formError && (
            <div className="rounded-lg border border-red-800 bg-red-950/50 p-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{formError}</span>
              </div>
            </div>
          )}

          {/* Conflicting Tasks Display */}
          {conflictingTasks.length > 0 && (
            <div className="rounded-lg border border-orange-800 bg-orange-950/50 p-3">
              <h4 className="mb-2 text-sm font-medium text-orange-400">
                Conflicting Tasks:
              </h4>
              <div className="space-y-2">
                {conflictingTasks.map((task) => (
                  <div key={task.id} className="text-xs text-orange-300">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-orange-400">
                      {dayjs(task.startTime).format('MMM D, YYYY h:mm A')} - {' '}
                      {dayjs(task.startTime).add(task.duration, 'minute').format('h:mm A')} ({task.duration} min)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Task"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}