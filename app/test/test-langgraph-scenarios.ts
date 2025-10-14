// Test file for comprehensive LangGraph agent testing
// Run this file to test different scenarios with the enhanced agent

import { AIScheduleGenerator } from "../lib/langgraph";

// Mock user ID for testing
const TEST_USER_ID = "test-user-123";

/**
 * Test Scenario 1: Basic Task Creation
 */
async function testBasicTaskCreation() {
  console.log("\n🧪 TEST 1: Basic Task Creation");
  console.log("=====================================");
  
  const result = await AIScheduleGenerator(
    "Create a study schedule for my computer science exam next week. I need to cover algorithms, data structures, and system design.",
    TEST_USER_ID
  );
  
  console.log("📄 Response:", result.description);
  console.log("📊 Tasks created:", result.tasks?.length || 0);
  console.log("🔧 Subtasks created:", result.subTasks?.length || 0);
  console.log("✅ Tasks created flag:", result.tasksCreated);
  console.log("✅ Subtasks created flag:", result.subTasksCreated);
  
  if (result.tasks && result.tasks.length > 0) {
    console.log("📋 Task details:");
    result.tasks.forEach((task, i) => {
      console.log(`  ${i + 1}. ${task.title} (${task.duration}min, ${task.priority})`);
    });
  }
  
  return result;
}

/**
 * Test Scenario 2: Task Creation + Subtasks for All Tasks
 */
async function testTaskCreationWithSubtasks() {
  console.log("\n🧪 TEST 2: Task Creation + Subtasks");
  console.log("=====================================");
  
  const result = await AIScheduleGenerator(
    "Create a workout schedule for this week and break down each session into specific exercises.",
    TEST_USER_ID
  );
  
  console.log("📄 Response:", result.description);
  console.log("📊 Tasks created:", result.tasks?.length || 0);
  console.log("🔧 Subtasks created:", result.subTasks?.length || 0);
  console.log("✅ Tasks created flag:", result.tasksCreated);
  console.log("✅ Subtasks created flag:", result.subTasksCreated);
  console.log("🎯 Intent flags:");
  console.log("  - Create tasks:", result.intentCreateTasks);
  console.log("  - Create subtasks:", result.intentCreateSubTasks);
  console.log("  - Clear schedule:", result.intentClearSchedule);
  
  if (result.subTasks && result.subTasks.length > 0) {
    console.log("📋 Subtask breakdown:");
    result.subTasks.forEach((subtask, i) => {
      console.log(`  ${i + 1}. ${subtask.description} (Task: ${subtask.taskId})`);
    });
  }
  
  return result;
}

/**
 * Test Scenario 3: Clear Schedule Functionality
 */
async function testClearSchedule() {
  console.log("\n🧪 TEST 3: Clear Schedule");
  console.log("=====================================");
  
  const result = await AIScheduleGenerator(
    "I want to start fresh with a new schedule. Clear everything and create a new daily routine for productivity.",
    TEST_USER_ID
  );
  
  console.log("📄 Response:", result.description);
  console.log("🗑️ Clear schedule intent:", result.intentClearSchedule);
  console.log("📊 Tasks created:", result.tasks?.length || 0);
  console.log("🔧 Subtasks created:", result.subTasks?.length || 0);
  
  return result;
}

/**
 * Test Scenario 4: Subtasks for Existing Tasks
 */
async function testSubtasksForExistingTasks() {
  console.log("\n🧪 TEST 4: Subtasks for Existing Tasks");
  console.log("=====================================");
  
  // First, ensure we have some tasks
  await AIScheduleGenerator(
    "Create a simple schedule: morning routine, work session, exercise",
    TEST_USER_ID
  );
  
  // Then ask for subtasks
  const result = await AIScheduleGenerator(
    "Add detailed steps for all my tasks",
    TEST_USER_ID
  );
  
  console.log("📄 Response:", result.description);
  console.log("🎯 Intent flags:");
  console.log("  - Create tasks:", result.intentCreateTasks);
  console.log("  - Create subtasks:", result.intentCreateSubTasks);
  console.log("  - Subtasks for all:", result.subTasksForAllTasks);
  console.log("📊 Existing tasks:", result.tasks?.length || 0);
  console.log("🔧 Subtasks created:", result.subTasks?.length || 0);
  
  return result;
}

/**
 * Test Scenario 5: Specific Task Subtasks
 */
async function testSpecificTaskSubtasks() {
  console.log("\n🧪 TEST 5: Specific Task Subtasks");
  console.log("=====================================");
  
  // First create tasks and get their IDs
  const setupResult = await AIScheduleGenerator(
    "Create tasks: Review math, Practice coding, Read history",
    TEST_USER_ID
  );
  
  if (setupResult.tasks && setupResult.tasks.length > 0) {
    const firstTask = setupResult.tasks[0];
    console.log(`🎯 Targeting task: "${firstTask.title}" (ID: ${firstTask.id})`);
    
    const result = await AIScheduleGenerator(
      `Break down my "${firstTask.title}" task into steps`,
      TEST_USER_ID
    );
    
    console.log("📄 Response:", result.description);
    console.log("🎯 Specific task ID:", result.specificTaskId);
    console.log("🔧 Subtasks created:", result.subTasks?.length || 0);
    
    return result;
  } else {
    console.log("❌ Failed to create setup tasks");
    return null;
  }
}

/**
 * Test Scenario 6: Edge Cases and Error Handling
 */
async function testEdgeCases() {
  console.log("\n🧪 TEST 6: Edge Cases");
  console.log("=====================================");
  
  // Test empty input
  console.log("\n📝 Testing empty input:");
  const emptyResult = await AIScheduleGenerator("", TEST_USER_ID);
  console.log("Response:", emptyResult.description);
  console.log("Workflow complete:", emptyResult.workflowComplete);
  
  // Test vague input
  console.log("\n📝 Testing vague input:");
  const vague = await AIScheduleGenerator("help", TEST_USER_ID);
  console.log("Response:", vague.description);
  
  // Test impossible request
  console.log("\n📝 Testing impossible request:");
  const impossible = await AIScheduleGenerator(
    "Create subtasks for my nonexistent quantum physics task",
    TEST_USER_ID
  );
  console.log("Response:", impossible.description);
  console.log("Error message:", impossible.errorMessage || "None");
  
  return { emptyResult, vague, impossible };
}

/**
 * Test Scenario 7: Complex Multi-Intent Request
 */
async function testComplexRequest() {
  console.log("\n🧪 TEST 7: Complex Multi-Intent");
  console.log("=====================================");
  
  const result = await AIScheduleGenerator(
    "Clear my schedule and create a comprehensive study plan for my final exams with detailed breakdown of each subject",
    TEST_USER_ID
  );
  
  console.log("📄 Response:", result.description);
  console.log("🎯 Intent analysis:");
  console.log("  - Create tasks:", result.intentCreateTasks);
  console.log("  - Create subtasks:", result.intentCreateSubTasks);
  console.log("  - Clear schedule:", result.intentClearSchedule);
  console.log("  - Subtasks for all:", result.subTasksForAllTasks);
  console.log("📊 Final state:");
  console.log("  - Tasks:", result.tasks?.length || 0);
  console.log("  - Subtasks:", result.subTasks?.length || 0);
  console.log("  - Tasks created flag:", result.tasksCreated);
  console.log("  - Subtasks created flag:", result.subTasksCreated);
  
  return result;
}

/**
 * Run all tests sequentially
 */
async function runAllTests() {
  console.log("🚀 Starting Comprehensive LangGraph Agent Testing");
  console.log("=".repeat(60));
  
  try {
    const results = {
      test1: await testBasicTaskCreation(),
      test2: await testTaskCreationWithSubtasks(),
      test3: await testClearSchedule(),
      test4: await testSubtasksForExistingTasks(),
      test5: await testSpecificTaskSubtasks(),
      test6: await testEdgeCases(),
      test7: await testComplexRequest(),
    };
    
    console.log("\n📊 TESTING SUMMARY");
    console.log("=".repeat(60));
    console.log("✅ All tests completed successfully!");
    console.log("\n📈 Performance Overview:");
    
    Object.entries(results).forEach(([testName, result]) => {
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        const hasTasksAndSubtasks = 'tasks' in result && 'subTasks' in result;
        if (hasTasksAndSubtasks) {
          const tasks = (result as any).tasks || [];
          const subTasks = (result as any).subTasks || [];
          console.log(`${testName}: Tasks=${tasks.length}, Subtasks=${subTasks.length}`);
        } else {
          console.log(`${testName}: Complex result (edge case test)`);
        }
      }
    });
    
    return results;
    
  } catch (error) {
    console.error("❌ Test execution failed:", error);
    throw error;
  }
}

// Export for external use
export {
  testBasicTaskCreation,
  testTaskCreationWithSubtasks,
  testClearSchedule,
  testSubtasksForExistingTasks,
  testSpecificTaskSubtasks,
  testEdgeCases,
  testComplexRequest,
  runAllTests,
};

// Auto-run if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log("\n🎉 Testing completed successfully!");
    })
    .catch((error) => {
      console.error("\n💥 Testing failed:", error);
      process.exit(1);
    });
}