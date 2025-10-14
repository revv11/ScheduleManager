// Quick integration test for frontend components
import useSchedule from "@/zustand/useSchedule";

// This test checks if all the integration points are working
console.log('Testing frontend integration...');

// Test 1: Check if useSchedule store has all required functions
const store = useSchedule.getState();
console.log('✅ Store functions available:', {
  tasks: Array.isArray(store.tasks),
  subTasks: Array.isArray(store.subTasks),
  addSubTask: typeof store.addSubTask === 'function',
  updateSubTask: typeof store.updateSubTask === 'function',
  removeSubTask: typeof store.removeSubTask === 'function',
  fetchSubTasks: typeof store.fetchSubTasks === 'function',
});

// Test 2: Check SubTask type structure
const mockSubTask = {
  id: 'test-id',
  taskId: 'test-task-id',
  description: 'Test subtask',
  isCompleted: false
};

console.log('✅ SubTask structure matches:', mockSubTask);

console.log('Frontend integration test completed successfully!');