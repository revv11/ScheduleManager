/**
 * Validate task form data on frontend
 * @param title - Task title
 * @param startTime - Task start time
 * @param duration - Task duration string
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateTaskForm(
  title: string, 
  startTime: string, 
  duration: string
): { isValid: boolean; error: string } {
  if (!title.trim()) {
    return { isValid: false, error: "Please enter a task title" };
  }
  
  if (!startTime) {
    return { isValid: false, error: "Please select a start time" };
  }
  
  // Validate start time format
  const startDate = new Date(startTime);
  if (isNaN(startDate.getTime())) {
    return { isValid: false, error: "Invalid start time format" };
  }
  
  const durationNum = parseInt(duration);
  if (!durationNum || durationNum <= 0) {
    return { isValid: false, error: "Please enter a valid duration (in minutes)" };
  }
  
  if (durationNum > 1440) {
    return { isValid: false, error: "Duration cannot exceed 24 hours (1440 minutes)" };
  }
  
  return { isValid: true, error: "" };
}

/**
 * Comprehensive validation for task creation including time validation and conflict checking
 * @param title - Task title
 * @param startDateTime - Task start date/time
 * @param duration - Task duration in minutes
 * @param existingTasks - Array of existing tasks to check for conflicts
 * @returns Object with isValid boolean, error message if invalid, and conflicting tasks if any
 */
export function validateTaskCreation(
  title: string,
  startDateTime: Date,
  duration: number,
  existingTasks: TaskType[]
): { 
  isValid: boolean; 
  error: string;
  conflictingTasks?: TaskType[];
} {
  // Basic validation
  if (!title.trim()) {
    return { isValid: false, error: "Please enter a task title" };
  }
  
  if (isNaN(startDateTime.getTime())) {
    return { isValid: false, error: "Invalid start time format" };
  }
  
  if (!duration || duration <= 0) {
    return { isValid: false, error: "Please enter a valid duration (in minutes)" };
  }
  
  if (duration > 1440) {
    return { isValid: false, error: "Duration cannot exceed 24 hours (1440 minutes)" };
  }
  
  const now = new Date();
  const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
  
  // Validate start time is not in the past
  if (startDateTime < now) {
    return { isValid: false, error: "Start time cannot be in the past" };
  }
  
  // Validate end time is after start time
  if (endDateTime <= startDateTime) {
    return { isValid: false, error: "End time must be after start time" };
  }
  
  // Validate end time is not in the past
  if (endDateTime < now) {
    return { isValid: false, error: "End time cannot be in the past" };
  }
  
  // Check for conflicts with existing tasks
  const conflicts = existingTasks.filter(task => {
    const taskStart = new Date(task.startTime);
    const taskEnd = new Date(taskStart.getTime() + task.duration * 60 * 1000);
    
    // Check if there's any overlap
    return (
      (startDateTime < taskEnd && endDateTime > taskStart)
    );
  });
  
  if (conflicts.length > 0) {
    return { 
      isValid: false, 
      error: "Time conflict detected with existing tasks",
      conflictingTasks: conflicts
    };
  }
  
  return { isValid: true, error: "" };
}