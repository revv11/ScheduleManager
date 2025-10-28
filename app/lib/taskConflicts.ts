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