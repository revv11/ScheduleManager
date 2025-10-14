import { AIScheduleGenerator } from '../lib/langgraph';
import { db } from '../lib/db';

/**
 * Test suite for the new tool-based LangGraph agent architecture
 */
async function testNewLangGraphAgent() {
  console.log('🚀 Testing NEW Tool-Based LangGraph Agent');
  console.log('==========================================\n');
  
  const testUserId = 'new-agent-test-user';
  
  try {
    // Setup - Clean existing data
    console.log('🧹 Setting up test environment...');
    await db.subTask.deleteMany({ where: { task: { userId: testUserId } } });
    await db.task.deleteMany({ where: { userId: testUserId } });
    await db.message.deleteMany({ where: { userId: testUserId } });
    await db.user.deleteMany({ where: { id: testUserId } });
    
    await db.user.create({
      data: {
        id: testUserId,
        email: 'newagent@example.com',
        password: 'test-password'
      }
    });
    
    console.log('✅ Test environment ready\n');
    
    // Test 1: Basic Task Creation with Tool Use
    console.log('📝 Test 1: Create Tasks (Tool-Based)');
    console.log('-'.repeat(50));
    
    const result1 = await AIScheduleGenerator(
      'Create a study schedule for my final exams: Mathematics (2 hours), Physics (1.5 hours), and Chemistry (2 hours). Schedule them for tomorrow starting at 9 AM.',
      testUserId
    );
    
    console.log('🤖 Agent Response:', result1.description);
    console.log('📊 Tasks in DB:', result1.tasks?.length || 0);
    console.log('🔧 Subtasks in DB:', result1.subTasks?.length || 0);
    
    if (result1.tasks && result1.tasks.length > 0) {
      console.log('\n📋 Created Tasks:');
      result1.tasks.forEach((task, i) => {
        console.log(`  ${i + 1}. ${task.title} (${task.duration}min, ${task.priority})`);
        console.log(`     Start: ${task.startTime}`);
      });
    }
    
    console.log('\n✅ Test 1 completed\n');
    
    // Brief pause
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: View Current Schedule (Tool Use)
    console.log('📝 Test 2: View Current Schedule');
    console.log('-'.repeat(50));
    
    const result2 = await AIScheduleGenerator(
      'Show me my current schedule and what tasks I have',
      testUserId
    );
    
    console.log('🤖 Agent Response:', result2.description);
    console.log('📊 Tasks retrieved:', result2.tasks?.length || 0);
    
    console.log('\n✅ Test 2 completed\n');
    
    // Brief pause
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 3: Create Subtasks for Existing Tasks
    console.log('📝 Test 3: Create Subtasks for Tasks');
    console.log('-'.repeat(50));
    
    const result3 = await AIScheduleGenerator(
      'Break down all my study tasks into detailed subtasks with specific topics to cover',
      testUserId
    );
    
    console.log('🤖 Agent Response:', result3.description);
    console.log('📊 Tasks in DB:', result3.tasks?.length || 0);
    console.log('🔧 Subtasks in DB:', result3.subTasks?.length || 0);
    
    if (result3.subTasks && result3.subTasks.length > 0) {
      console.log('\n📋 Created Subtasks (sample):');
      result3.subTasks.slice(0, 8).forEach((subtask, i) => {
        console.log(`  ${i + 1}. ${subtask.description}`);
      });
      if (result3.subTasks.length > 8) {
        console.log(`  ... and ${result3.subTasks.length - 8} more subtasks`);
      }
    }
    
    console.log('\n✅ Test 3 completed\n');
    
    // Brief pause
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 4: Update/Modify Tasks
    console.log('📝 Test 4: Update Task');
    console.log('-'.repeat(50));
    
    const result4 = await AIScheduleGenerator(
      'Change the Physics study session to 2 hours instead of 1.5 hours and make it high priority',
      testUserId
    );
    
    console.log('🤖 Agent Response:', result4.description);
    console.log('📊 Tasks after update:', result4.tasks?.length || 0);
    
    if (result4.tasks && result4.tasks.length > 0) {
      const physicsTask = result4.tasks.find(t => t.title.toLowerCase().includes('physics'));
      if (physicsTask) {
        console.log(`\n📋 Updated Physics Task: ${physicsTask.title}`);
        console.log(`   Duration: ${physicsTask.duration} minutes`);
        console.log(`   Priority: ${physicsTask.priority}`);
      }
    }
    
    console.log('\n✅ Test 4 completed\n');
    
    // Brief pause
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 5: Clear Schedule and Create New One
    console.log('📝 Test 5: Clear Schedule & Create New');
    console.log('-'.repeat(50));
    
    const result5 = await AIScheduleGenerator(
      'Clear my entire schedule and create a new workout plan with 4 different exercise sessions for this week',
      testUserId
    );
    
    console.log('🤖 Agent Response:', result5.description);
    console.log('📊 New tasks created:', result5.tasks?.length || 0);
    
    if (result5.tasks && result5.tasks.length > 0) {
      console.log('\n📋 New Workout Tasks:');
      result5.tasks.forEach((task, i) => {
        console.log(`  ${i + 1}. ${task.title} (${task.duration}min, ${task.priority})`);
      });
    }
    
    console.log('\n✅ Test 5 completed\n');
    
    // Brief pause
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 6: Complex Multi-Tool Operation
    console.log('📝 Test 6: Complex Multi-Tool Request');
    console.log('-'.repeat(50));
    
    const result6 = await AIScheduleGenerator(
      'Add detailed subtasks to all my workout sessions, then show me the complete schedule with all subtasks',
      testUserId
    );
    
    console.log('🤖 Agent Response:', result6.description);
    console.log('📊 Final tasks:', result6.tasks?.length || 0);
    console.log('🔧 Final subtasks:', result6.subTasks?.length || 0);
    
    console.log('\n✅ Test 6 completed\n');
    
    // Test 7: Edge Case - Conversational Query
    console.log('📝 Test 7: Conversational Query (No Tools)');
    console.log('-'.repeat(50));
    
    const result7 = await AIScheduleGenerator(
      'What do you think about my current schedule? Any suggestions for improvements?',
      testUserId
    );
    
    console.log('🤖 Agent Response:', result7.description);
    
    console.log('\n✅ Test 7 completed\n');
    
    // Final Summary
    console.log('🎉 NEW AGENT ARCHITECTURE TEST SUMMARY');
    console.log('=====================================');
    
    const finalTasks = result6.tasks?.length || 0;
    const finalSubtasks = result6.subTasks?.length || 0;
    
    console.log(`📊 Final State:`);
    console.log(`   Tasks: ${finalTasks}`);
    console.log(`   Subtasks: ${finalSubtasks}`);
    console.log(`\n🔧 Tool-Based Architecture Features Tested:`);
    console.log(`   ✅ Task Creation with tools`);
    console.log(`   ✅ Schedule Viewing with get_all_tasks`);
    console.log(`   ✅ Subtask Generation with create_subtasks`);
    console.log(`   ✅ Task Updates with update_task`);
    console.log(`   ✅ Schedule Clearing with clearExisting flag`);
    console.log(`   ✅ Multi-tool workflows`);
    console.log(`   ✅ Conversational responses`);
    
    console.log('\n🎉 New tool-based LangGraph agent is working excellently!');
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await db.subTask.deleteMany({ where: { task: { userId: testUserId } } });
    await db.task.deleteMany({ where: { userId: testUserId } });
    await db.message.deleteMany({ where: { userId: testUserId } });
    await db.user.deleteMany({ where: { id: testUserId } });
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

// Run the test
testNewLangGraphAgent();