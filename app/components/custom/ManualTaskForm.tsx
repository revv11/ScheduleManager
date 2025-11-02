"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-hot-toast";
import { validateTaskCreation } from "@/lib/taskConflicts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/app/datepicker.css";
import useSchedule from "@/zustand/useSchedule";

interface ManualTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: TaskType | null; // Optional task for editing mode
}

interface TaskFormData {
  title: string;
  startDate: Date;
  startHour: string;
  startMinute: string;
  startPeriod: "AM" | "PM";
  endHour: string;
  endMinute: string;
  endPeriod: "AM" | "PM";
  duration: string;
  priority: Priority;
}

type TimeInputMode = "duration" | "endTime";

export default function ManualTaskForm({ 
  isOpen, 
  onClose, 
  onSuccess,
  task
}: ManualTaskFormProps) {
  const isEditMode = !!task;
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    startDate: new Date(),
    startHour: "",
    startMinute: "",
    startPeriod: new Date().getHours() >= 12 ? "PM" : "AM",
    endHour: "",
    endMinute: "",
    endPeriod: new Date().getHours() >= 12 ? "PM" : "AM",
    duration: "",
    priority: "MEDIUM"
  });
  const [timeInputMode, setTimeInputMode] = useState<TimeInputMode>("duration");
  const [conflictingTasks, setConflictingTasks] = useState<TaskType[]>([]);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get tasks from Zustand store for conflict checking
  const { tasks } = useSchedule();

  // Populate form when task changes (edit mode)
  useEffect(() => {
    if (task && isOpen) {
      const taskStartTime = new Date(task.startTime);
      const taskEndTime = new Date(taskStartTime.getTime() + task.duration * 60 * 1000);
      
  // Extract hours and minutes for start time
  const startHour24 = taskStartTime.getHours();
      const startMinute = taskStartTime.getMinutes();
      const startPeriod = startHour24 >= 12 ? "PM" : "AM";
  let startHour12 = startHour24 % 12;
      if (startHour12 === 0) startHour12 = 12;
      
  // Extract hours and minutes for end time
  const endHour24 = taskEndTime.getHours();
      const endMinute = taskEndTime.getMinutes();
      const endPeriod = endHour24 >= 12 ? "PM" : "AM";
  let endHour12 = endHour24 % 12;
      if (endHour12 === 0) endHour12 = 12;
      
      setFormData({
        title: task.title,
        startDate: taskStartTime,
        startHour: startHour12.toString(),
        startMinute: startMinute.toString().padStart(2, '0'),
        startPeriod: startPeriod,
        endHour: endHour12.toString(),
        endMinute: endMinute.toString().padStart(2, '0'),
        endPeriod: endPeriod,
        duration: task.duration.toString(),
        priority: task.priority
      });
    }
  }, [task, isOpen]);

  const handleSubmit = async () => {
    // Reset errors
    setFormError("");
    setConflictingTasks([]);
    setIsSubmitting(true);
    
    try {
      // Validate time inputs
      if (!formData.startHour || !formData.startMinute) {
        setFormError("Please enter start time");
        setIsSubmitting(false);
        return;
      }

      // Convert 12-hour to 24-hour format
      let startHour24 = parseInt(formData.startHour);
      if (formData.startPeriod === "PM" && startHour24 !== 12) {
        startHour24 += 12;
      } else if (formData.startPeriod === "AM" && startHour24 === 12) {
        startHour24 = 0;
      }

      // Create start date time
      const startDateTime = new Date(formData.startDate);
      startDateTime.setHours(startHour24, parseInt(formData.startMinute), 0, 0);
      
      const duration = parseInt(formData.duration);
      
      // Validate task creation with comprehensive checks including conflict detection
      // Filter out current task in edit mode to avoid self-conflict
      const tasksToCheck = isEditMode 
        ? tasks.filter(t => t.id !== task?.id)
        : tasks;
      
      const validation = validateTaskCreation(
        formData.title,
        startDateTime,
        duration,
        tasksToCheck
      );
      
      if (!validation.isValid) {
        setFormError(validation.error);
        if (validation.conflictingTasks) {
          setConflictingTasks(validation.conflictingTasks);
        }
        setIsSubmitting(false);
        return;
      }
      
      // Submit to API
      const response = isEditMode
        ? await axios.patch(`/api/tasks/${task?.id}`, {
            title: formData.title,
            startTime: startDateTime.toISOString(),
            duration: duration,
            priority: formData.priority
          })
        : await axios.post('/api/tasks', {
            title: formData.title,
            startTime: startDateTime.toISOString(),
            duration: duration,
            priority: formData.priority
          });
      
      if (response.data.success) {
        toast.success(isEditMode ? "Task updated successfully!" : "Task created successfully!");
        handleClose();
        onSuccess(); // Trigger refresh of tasks
      } else {
        setFormError(response.data.error || (isEditMode ? "Failed to update task" : "Failed to create task"));
      }
      
    } catch (error: any) {
      console.error(isEditMode ? "Error updating task:" : "Error creating task:", error);
      
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
      } else if (error.response?.status === 404) {
        setFormError("Task not found");
        toast.error("Task not found");
      } else {
        setFormError(isEditMode ? "Failed to update task. Please try again." : "Failed to create task. Please try again.");
        toast.error(isEditMode ? "Failed to update task" : "Failed to create task");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ 
      title: "", 
      startDate: new Date(),
      startHour: "",
      startMinute: "",
      startPeriod: new Date().getHours() >= 12 ? "PM" : "AM",
      endHour: "",
      endMinute: "",
      endPeriod: new Date().getHours() >= 12 ? "PM" : "AM",
      duration: "",
      priority: "MEDIUM"
    });
    setFormError("");
    setConflictingTasks([]);
    setTimeInputMode("duration");
    onClose();
  };

  const updateFormData = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate when end time fields change
      if ((field === "endHour" || field === "endMinute" || field === "endPeriod") && 
          newData.startHour && newData.startMinute && newData.endHour && newData.endMinute) {
        
        let startHour24 = parseInt(newData.startHour);
        if (newData.startPeriod === "PM" && startHour24 !== 12) startHour24 += 12;
        else if (newData.startPeriod === "AM" && startHour24 === 12) startHour24 = 0;
        
        let endHour24 = parseInt(newData.endHour);
        if (newData.endPeriod === "PM" && endHour24 !== 12) endHour24 += 12;
        else if (newData.endPeriod === "AM" && endHour24 === 12) endHour24 = 0;
        
        const startMinutes = startHour24 * 60 + parseInt(newData.startMinute);
        const endMinutes = endHour24 * 60 + parseInt(newData.endMinute);
        const durationMinutes = endMinutes - startMinutes;
        
        if (durationMinutes > 0) {
          newData.duration = durationMinutes.toString();
        }
      }
      
      // Auto-calculate when duration changes
      if (field === "duration" && newData.startHour && newData.startMinute && value) {
        const durationNum = parseInt(value);
        if (!isNaN(durationNum) && durationNum > 0) {
          let startHour24 = parseInt(newData.startHour);
          if (newData.startPeriod === "PM" && startHour24 !== 12) startHour24 += 12;
          else if (newData.startPeriod === "AM" && startHour24 === 12) startHour24 = 0;
          
          const startMinutes = startHour24 * 60 + parseInt(newData.startMinute);
          const endMinutes = startMinutes + durationNum;
          
          const endHour24 = Math.floor(endMinutes / 60) % 24;
          const endMin = endMinutes % 60;
          
          const endPeriod = endHour24 >= 12 ? "PM" : "AM";
          let endHour12 = endHour24 % 12;
          if (endHour12 === 0) endHour12 = 12;
          
          newData.endHour = endHour12.toString();
          newData.endMinute = endMin.toString().padStart(2, '0');
          newData.endPeriod = endPeriod;
        }
      }
      
      // Auto-calculate when start time changes
      if ((field === "startHour" || field === "startMinute" || field === "startPeriod") && 
          newData.duration && newData.startHour && newData.startMinute) {
        const durationNum = parseInt(newData.duration);
        if (!isNaN(durationNum) && durationNum > 0) {
          let startHour24 = parseInt(newData.startHour);
          if (newData.startPeriod === "PM" && startHour24 !== 12) startHour24 += 12;
          else if (newData.startPeriod === "AM" && startHour24 === 12) startHour24 = 0;
          
          const startMinutes = startHour24 * 60 + parseInt(newData.startMinute);
          const endMinutes = startMinutes + durationNum;
          
          const endHour24 = Math.floor(endMinutes / 60) % 24;
          const endMin = endMinutes % 60;
          
          const endPeriod = endHour24 >= 12 ? "PM" : "AM";
          let endHour12 = endHour24 % 12;
          if (endHour12 === 0) endHour12 = 12;
          
          newData.endHour = endHour12.toString();
          newData.endMinute = endMin.toString().padStart(2, '0');
          newData.endPeriod = endPeriod;
        }
      }
      
      return newData;
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="mx-4 w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{isEditMode ? "Edit Task" : "Add New Task"}</h3>
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

          {/* Date Picker */}
          <div>
            <Label className="text-zinc-300">Date</Label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => updateFormData("startDate", date || new Date())}
              dateFormat="MMMM d, yyyy"
              className="mt-1 w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              calendarClassName="bg-zinc-900 border-zinc-700"
              minDate={new Date()}
              withPortal
            >
              <div className="flex justify-end gap-2 p-2 border-t border-zinc-700 bg-zinc-900">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateFormData("startDate", new Date())}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Today
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const picker = document.querySelector('.react-datepicker__portal');
                    if (picker) {
                      (picker as HTMLElement).style.display = 'none';
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Confirm
                </Button>
              </div>
            </DatePicker>
          </div>

          {/* Start Time Input */}
          <div>
            <Label className="text-zinc-300">Start Time</Label>
            <div className="mt-1 flex gap-2 items-center">
              <Input
                type="number"
                min="1"
                max="12"
                placeholder="HH"
                value={formData.startHour}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                    updateFormData("startHour", val);
                  }
                }}
                className="w-20 bg-zinc-800 border-zinc-700 text-center text-lg font-semibold"
              />
              <span className="text-zinc-500 text-xl">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                placeholder="MM"
                value={formData.startMinute}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
                    updateFormData("startMinute", val);
                  }
                }}
                className="w-20 bg-zinc-800 border-zinc-700 text-center text-lg font-semibold"
              />
              <select
                value={formData.startPeriod}
                onChange={(e) => updateFormData("startPeriod", e.target.value as "AM" | "PM")}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* Toggle between Duration and End Time */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Label className="text-zinc-300">Time Input</Label>
              <div className="flex rounded-lg bg-zinc-800 p-1">
                <button
                  type="button"
                  onClick={() => setTimeInputMode("duration")}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    timeInputMode === "duration"
                      ? "bg-purple-600 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Duration
                </button>
                <button
                  type="button"
                  onClick={() => setTimeInputMode("endTime")}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    timeInputMode === "endTime"
                      ? "bg-purple-600 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  End Time
                </button>
              </div>
            </div>

            {timeInputMode === "duration" ? (
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
                {formData.endHour && formData.endMinute && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Ends at: {formData.endHour}:{formData.endMinute} {formData.endPeriod}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <Label className="text-zinc-300">End Time</Label>
                <div className="mt-1 flex gap-2 items-center">
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    placeholder="HH"
                    value={formData.endHour}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                        updateFormData("endHour", val);
                      }
                    }}
                    className="w-20 bg-zinc-800 border-zinc-700 text-center text-lg font-semibold"
                  />
                  <span className="text-zinc-500 text-xl">:</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="MM"
                    value={formData.endMinute}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
                        updateFormData("endMinute", val);
                      }
                    }}
                    className="w-20 bg-zinc-800 border-zinc-700 text-center text-lg font-semibold"
                  />
                  <select
                    value={formData.endPeriod}
                    onChange={(e) => updateFormData("endPeriod", e.target.value as "AM" | "PM")}
                    className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                {formData.duration && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Duration: {formData.duration} minutes
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="priority" className="text-zinc-300">
              Priority
            </Label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => updateFormData("priority", e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
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
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Task" : "Add Task"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}