#!/usr/bin/env node

/**
 * Comprehensive LangGraph Agent Test Suite
 * 
 * This script tests all functionality of the enhanced LangGraph agent including:
 * - Basic task creation
 * - Task creation with automatic subtasks
 * - Clear schedule functionality
 * - Subtask generation for existing tasks
 * - Edge cases and error handling
 * - Performance benchmarks
 * 
 * Usage: node run-tests.js [--userId=custom-user] [--scenario=specific-test]
 */

const { AIScheduleGenerator } = require('../lib/langgraph');
const { db } = require('../lib/db');

// Test configuration
const DEFAULT_USER_ID = 'test-user-langgraph';
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Helper functions
function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function success(message) { log('green', `✅ ${message}`); }
function error(message) { log('red', `❌ ${message}`); }
function info(message) { log('blue', `ℹ️  ${message}`); }
function warning(message) { log('yellow', `⚠️  ${message}`); }
function highlight(message) { log('cyan', `🎯 ${message}`); }

async function cleanupUser(userId) {
  try {
    await db.subTask.deleteMany({ where: { task: { userId } } });
    await db.task.deleteMany({ where: { userId } });
    await db.message.deleteMany({ where: { userId } });
    info(`Cleaned up data for user: ${userId}`);
  } catch (err) {
    warning(`Cleanup failed: ${err.message}`);
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test scenarios
const TEST_SCENARIOS = {
  async basicTaskCreation(userId) {
    highlight('TEST 1: Basic Task Creation');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    const result = await AIScheduleGenerator(
      'Create a study schedule for my computer science exam. I need to cover algorithms, data structures, system design, and database concepts.',
      userId
    );
    const duration = Date.now() - startTime;
    
    // Validate results
    const checks = {
      hasDescription: !!result.description,
      intentCreateTasks: result.intentCreateTasks === true,
      intentCreateSubTasks: result.intentCreateSubTasks === false, // Should be false for basic creation
      intentClearSchedule: result.intentClearSchedule === false,
      tasksCreated: result.tasksCreated === true,
      hasTasks: (result.tasks?.length || 0) > 0,
      workflowComplete: result.workflowComplete !== true || !result.errorMessage
    };
    
    console.log('📊 Results:');
    console.log(`   Description: ${result.description}`);
    console.log(`   Tasks created: ${result.tasks?.length || 0}`);
    console.log(`   Subtasks created: ${result.subTasks?.length || 0}`);
    console.log(`   Duration: ${duration}ms`);
    
    console.log('🔍 Validation:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    if (result.tasks && result.tasks.length > 0) {
      console.log('📋 Created Tasks:');
      result.tasks.forEach((task, i) => {
        console.log(`   ${i + 1}. ${task.title} (${task.duration}min, ${task.priority})`);
      });
    }
    
    const allPassed = Object.values(checks).every(Boolean);
    if (allPassed) {
      success('Basic task creation test PASSED');
    } else {
      error('Basic task creation test FAILED');
    }
    
    return { passed: allPassed, duration, result };
  },

  async taskCreationWithSubtasks(userId) {
    highlight('TEST 2: Task Creation + Automatic Subtasks');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    const result = await AIScheduleGenerator(
      'Create a workout schedule for this week and break down each session into specific exercises and steps.',
      userId
    );
    const duration = Date.now() - startTime;
    
    const checks = {
      hasDescription: !!result.description,
      intentCreateTasks: result.intentCreateTasks === true,
      intentCreateSubTasks: result.intentCreateSubTasks === true,
      tasksCreated: result.tasksCreated === true,
      subTasksCreated: result.subTasksCreated === true,
      hasTasks: (result.tasks?.length || 0) > 0,
      hasSubTasks: (result.subTasks?.length || 0) > 0,
      subtaskRatio: (result.subTasks?.length || 0) >= (result.tasks?.length || 0) * 2 // At least 2 subtasks per task
    };
    
    console.log('📊 Results:');
    console.log(`   Description: ${result.description}`);
    console.log(`   Tasks created: ${result.tasks?.length || 0}`);
    console.log(`   Subtasks created: ${result.subTasks?.length || 0}`);
    console.log(`   Duration: ${duration}ms`);
    
    console.log('🔍 Validation:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    if (result.subTasks && result.subTasks.length > 0) {
      console.log('📋 Created Subtasks (sample):');
      result.subTasks.slice(0, 5).forEach((subtask, i) => {
        console.log(`   ${i + 1}. ${subtask.description}`);
      });
      if (result.subTasks.length > 5) {
        console.log(`   ... and ${result.subTasks.length - 5} more`);
      }
    }
    
    const allPassed = Object.values(checks).every(Boolean);
    if (allPassed) {
      success('Task creation with subtasks test PASSED');
    } else {
      error('Task creation with subtasks test FAILED');
    }
    
    return { passed: allPassed, duration, result };
  },

  async clearScheduleTest(userId) {
    highlight('TEST 3: Clear Schedule Functionality');
    console.log('=' .repeat(60));
    
    // First ensure we have some tasks
    info('Setting up existing tasks first...');
    await AIScheduleGenerator('Create tasks: morning routine, work session, exercise', userId);
    
    await delay(1000); // Brief pause
    
    const startTime = Date.now();
    const result = await AIScheduleGenerator(
      'I want to start fresh with a completely new schedule. Clear everything and create a new productivity routine.',
      userId
    );
    const duration = Date.now() - startTime;
    
    const checks = {
      hasDescription: !!result.description,
      intentClearSchedule: result.intentClearSchedule === true,
      intentCreateTasks: result.intentCreateTasks === true,
      tasksCreated: result.tasksCreated === true,
      hasTasks: (result.tasks?.length || 0) > 0
    };
    
    console.log('📊 Results:');
    console.log(`   Description: ${result.description}`);
    console.log(`   Clear intent detected: ${result.intentClearSchedule}`);
    console.log(`   New tasks created: ${result.tasks?.length || 0}`);
    console.log(`   Duration: ${duration}ms`);
    
    console.log('🔍 Validation:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allPassed = Object.values(checks).every(Boolean);
    if (allPassed) {
      success('Clear schedule test PASSED');
    } else {
      error('Clear schedule test FAILED');
    }
    
    return { passed: allPassed, duration, result };
  },

  async subtasksForExistingTasks(userId) {
    highlight('TEST 4: Add Subtasks to Existing Tasks');
    console.log('=' .repeat(60));
    
    // Setup: Create some tasks first
    info('Creating base tasks first...');
    await AIScheduleGenerator('Create these tasks: Review math concepts, Practice coding problems, Read history chapter', userId);
    
    await delay(1000);
    
    const startTime = Date.now();
    const result = await AIScheduleGenerator(
      'Add detailed step-by-step breakdowns for all my existing tasks',
      userId
    );
    const duration = Date.now() - startTime;
    
    const checks = {
      hasDescription: !!result.description,
      intentCreateTasks: result.intentCreateTasks === false,
      intentCreateSubTasks: result.intentCreateSubTasks === true,
      subTasksCreated: result.subTasksCreated === true,
      hasExistingTasks: (result.tasks?.length || 0) > 0,
      hasNewSubTasks: (result.subTasks?.length || 0) > 0
    };
    
    console.log('📊 Results:');
    console.log(`   Description: ${result.description}`);
    console.log(`   Existing tasks: ${result.tasks?.length || 0}`);
    console.log(`   New subtasks: ${result.subTasks?.length || 0}`);
    console.log(`   Duration: ${duration}ms`);
    
    console.log('🔍 Validation:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allPassed = Object.values(checks).every(Boolean);
    if (allPassed) {
      success('Subtasks for existing tasks test PASSED');
    } else {
      error('Subtasks for existing tasks test FAILED');
    }
    
    return { passed: allPassed, duration, result };
  },

  async edgeCasesTest(userId) {
    highlight('TEST 5: Edge Cases and Error Handling');
    console.log('=' .repeat(60));
    
    const tests = [];
    
    // Test 5a: Empty input
    info('Testing empty input...');
    const emptyResult = await AIScheduleGenerator('', userId);
    tests.push({
      name: 'Empty Input',
      passed: !!emptyResult.description && emptyResult.workflowComplete !== false
    });
    
    // Test 5b: Vague input
    info('Testing vague input...');
    const vagueResult = await AIScheduleGenerator('help me', userId);
    tests.push({
      name: 'Vague Input',
      passed: !!vagueResult.description
    });
    
    // Test 5c: Impossible request
    info('Testing impossible request...');
    const impossibleResult = await AIScheduleGenerator('Create subtasks for my nonexistent quantum physics project', userId);
    tests.push({
      name: 'Impossible Request',
      passed: !!impossibleResult.description || !!impossibleResult.errorMessage
    });
    
    console.log('🔍 Edge Case Results:');
    tests.forEach(test => {
      console.log(`   ${test.passed ? '✅' : '❌'} ${test.name}`);
    });
    
    const allPassed = tests.every(t => t.passed);
    if (allPassed) {
      success('Edge cases test PASSED');
    } else {
      error('Edge cases test FAILED');
    }
    
    return { passed: allPassed, duration: 0, result: { tests } };
  },

  async complexMultiIntentTest(userId) {
    highlight('TEST 6: Complex Multi-Intent Request');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    const result = await AIScheduleGenerator(
      'Clear my current schedule completely and create a comprehensive final exam study plan with detailed breakdown of each subject including specific topics and time allocations',
      userId
    );
    const duration = Date.now() - startTime;
    
    const checks = {
      hasDescription: !!result.description,
      intentClearSchedule: result.intentClearSchedule === true,
      intentCreateTasks: result.intentCreateTasks === true,
      intentCreateSubTasks: result.intentCreateSubTasks === true,
      tasksCreated: result.tasksCreated === true,
      subTasksCreated: result.subTasksCreated === true,
      hasTasks: (result.tasks?.length || 0) > 0,
      hasSubTasks: (result.subTasks?.length || 0) > 0
    };
    
    console.log('📊 Results:');
    console.log(`   Description: ${result.description}`);
    console.log(`   Multi-intent flags: Clear=${result.intentClearSchedule}, Tasks=${result.intentCreateTasks}, Subtasks=${result.intentCreateSubTasks}`);
    console.log(`   Final state: ${result.tasks?.length || 0} tasks, ${result.subTasks?.length || 0} subtasks`);
    console.log(`   Duration: ${duration}ms`);
    
    console.log('🔍 Validation:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allPassed = Object.values(checks).every(Boolean);
    if (allPassed) {
      success('Complex multi-intent test PASSED');
    } else {
      error('Complex multi-intent test FAILED');
    }
    
    return { passed: allPassed, duration, result };
  }
};

// Main test runner
async function runAllTests(userId = DEFAULT_USER_ID) {
  console.log(COLORS.magenta + '🚀 LANGGRAPH AGENT COMPREHENSIVE TEST SUITE' + COLORS.reset);
  console.log('=' .repeat(80));
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`👤 Test User ID: ${userId}`);
  console.log();
  
  // Clean up before testing
  await cleanupUser(userId);
  
  const results = [];
  const testNames = Object.keys(TEST_SCENARIOS);
  
  for (let i = 0; i < testNames.length; i++) {
    const testName = testNames[i];
    const testFn = TEST_SCENARIOS[testName];
    
    try {
      console.log(`\n[${i + 1}/${testNames.length}] Running ${testName}...`);
      const result = await testFn(userId);
      results.push({ testName, ...result });
      
      // Brief pause between tests
      if (i < testNames.length - 1) {
        await delay(2000);
      }
    } catch (error) {
      error(`Test ${testName} failed with error: ${error.message}`);
      results.push({ 
        testName, 
        passed: false, 
        duration: 0, 
        error: error.message,
        result: null 
      });
    }
  }
  
  // Final summary
  console.log('\n' + COLORS.magenta + '📊 TEST SUMMARY' + COLORS.reset);
  console.log('=' .repeat(80));
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  
  results.forEach((result, i) => {
    const status = result.passed ? COLORS.green + '✅ PASS' : COLORS.red + '❌ FAIL';
    const duration = result.duration ? `(${result.duration}ms)` : '';
    console.log(`${i + 1}. ${result.testName}: ${status}${COLORS.reset} ${duration}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log();
  console.log(`📈 Overall Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);
  
  if (passedTests === totalTests) {
    success('🎉 ALL TESTS PASSED! LangGraph agent is working correctly.');
  } else {
    error(`⚠️  ${totalTests - passedTests} test(s) failed. Please review the results above.`);
  }
  
  // Clean up after testing
  await cleanupUser(userId);
  
  return results;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  let userId = DEFAULT_USER_ID;
  let specificScenario = null;
  
  args.forEach(arg => {
    if (arg.startsWith('--userId=')) {
      userId = arg.split('=')[1];
    } else if (arg.startsWith('--scenario=')) {
      specificScenario = arg.split('=')[1];
    }
  });
  
  try {
    if (specificScenario && TEST_SCENARIOS[specificScenario]) {
      console.log(`Running specific scenario: ${specificScenario}`);
      await cleanupUser(userId);
      const result = await TEST_SCENARIOS[specificScenario](userId);
      console.log('Result:', result);
    } else if (specificScenario) {
      error(`Unknown scenario: ${specificScenario}`);
      console.log('Available scenarios:', Object.keys(TEST_SCENARIOS).join(', '));
    } else {
      await runAllTests(userId);
    }
  } catch (err) {
    error(`Test execution failed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

// Export for use in other files
module.exports = {
  runAllTests,
  TEST_SCENARIOS,
  cleanupUser
};

// Run if called directly
if (require.main === module) {
  main();
}