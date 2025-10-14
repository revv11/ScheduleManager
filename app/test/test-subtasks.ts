import { AIScheduleGenerator } from '../lib/langgraph';
import { db } from '../lib/db';

/**
 * Test subtask generation after establishing tasks
 */
async function testSubTaskGeneration() {
  console.log('🔧 SubTask Generation Test');
  console.log('==========================\n');
  
  const testUserId = 'subtask-test-user';
  
  try {
    // Setup
    console.log('🧹 Setting up environment...');
    await db.subTask.deleteMany({ where: { task: { userId: testUserId } } });
    await db.task.deleteMany({ where: { userId: testUserId } });
    await db.user.deleteMany({ where: { id: testUserId } });
    
    await db.user.create({
      data: {
        id: testUserId,
        email: 'subtask-test@example.com',
        password: 'test-password'
      }
    });
    console.log('   ✅ Environment ready\n');

    // STEP 1: Create some tasks first
    console.log('📋 STEP 1: Creating initial tasks');
    console.log('─'.repeat(40));
    
    const step1 = await AIScheduleGenerator("Create 2 learning tasks", testUserId);
    
    console.log('✅ Tasks created:');
    console.log(`   Count: ${step1.tasks?.length || 0}`);
    if (step1.tasks) {
      step1.tasks.forEach((task, i) => {
        console.log(`   ${i + 1}. "${task.title}" (ID: ${task.id})`);
      });
    }
    console.log('');

    // STEP 2: Generate subtasks for all tasks  
    console.log('🔧 STEP 2: Generate subtasks for all tasks');
    console.log('─'.repeat(40));
    
    const step2 = await AIScheduleGenerator("Break down all my tasks into steps", testUserId);
    
    console.log('✅ SubTasks generated:');
    console.log(`   Count: ${step2.subTasks?.length || 0}`);
    if (step2.subTasks) {
      step2.subTasks.forEach((st, i) => {
        console.log(`   ${i + 1}. "${st.description}" (TaskID: ${st.taskId})`);
      });
    }
    console.log('');

    // STEP 3: Generate subtasks for specific task
    if (step1.tasks && step1.tasks.length > 0) {
      const firstTask = step1.tasks[0];
      console.log('🎯 STEP 3: Generate subtasks for specific task');
      console.log(`Target: "${firstTask.title}" (ID: ${firstTask.id})`);
      console.log('─'.repeat(40));
      
      const step3 = await AIScheduleGenerator("Break down my learning task into detailed steps", testUserId);
      
      console.log('✅ Specific SubTasks generated:');
      console.log(`   Count: ${step3.subTasks?.length || 0}`);
      if (step3.subTasks) {
        step3.subTasks.forEach((st, i) => {
          console.log(`   ${i + 1}. "${st.description}" (TaskID: ${st.taskId})`);
        });
      }
      console.log('');
    }

    // FINAL VERIFICATION
    console.log('💾 Final Database State:');
    console.log('─'.repeat(40));
    
    const finalTasks = await db.task.findMany({
      where: { userId: testUserId },
      include: { subTasks: true }
    });

    console.log(`   Total Tasks: ${finalTasks.length}`);
    console.log(`   Total SubTasks: ${finalTasks.reduce((acc, t) => acc + t.subTasks.length, 0)}`);
    
    finalTasks.forEach((task, i) => {
      console.log(`\n   ${i + 1}. "${task.title}"`);
      console.log(`      └── ${task.subTasks.length} subtasks`);
      task.subTasks.forEach((st, j) => {
        const status = st.isCompleted ? '✅' : '⭕';
        console.log(`          ${status} ${st.description}`);
      });
    });

    // Analysis
    console.log('\n🎯 Test Analysis:');
    const hasSubTasks = finalTasks.some(t => t.subTasks.length > 0);
    if (hasSubTasks) {
      console.log('   ✅ SUCCESS: SubTask generation is working!');
    } else {
      console.log('   ❌ ISSUE: No subtasks were generated');
    }

  } catch (error: any) {
    console.error('❌ Test Error:', error?.message || String(error));
  }
}

testSubTaskGeneration();