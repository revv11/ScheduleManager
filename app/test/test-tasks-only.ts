import { AIScheduleGenerator } from '../lib/langgraph';
import { db } from '../lib/db';

/**
 * Simple test for task creation only
 */
async function testTaskCreation() {
  console.log('📋 Simple Task Creation Test');
  console.log('============================\n');
  
  const testUserId = 'task-test-user';
  
  try {
    // Setup
    console.log('🧹 Setting up environment...');
    await db.subTask.deleteMany({ where: { task: { userId: testUserId } } });
    await db.task.deleteMany({ where: { userId: testUserId } });
    await db.user.deleteMany({ where: { id: testUserId } });
    
    await db.user.create({
      data: {
        id: testUserId,
        email: 'task-test@example.com',
        password: 'test-password'
      }
    });
    console.log('   ✅ Environment ready\n');

    // Test simple task creation
    console.log('📝 Testing: "Create 2 simple tasks"');
    console.log('─'.repeat(40));
    
    const result = await AIScheduleGenerator("Create 2 simple tasks", testUserId);
    
    console.log('\n📊 Results:');
    console.log(`   Tasks Generated: ${result.tasks?.length || 0}`);
    console.log(`   Description: ${result.description?.substring(0, 100)}...`);
    
    if (result.tasks && result.tasks.length > 0) {
      console.log('\n✅ Generated Tasks:');
      result.tasks.forEach((task, i) => {
        console.log(`   ${i + 1}. "${task.title}"`);
        console.log(`      Duration: ${task.duration} minutes`);
        console.log(`      Priority: ${task.priority}`);
        console.log(`      ID: ${task.id}`);
        console.log(`      Start: ${task.startTime}`);
      });
    } else {
      console.log('\n❌ No tasks generated - investigating...');
    }

    // Check what's actually in the database
    console.log('\n💾 Database Verification:');
    const dbTasks = await db.task.findMany({
      where: { userId: testUserId },
      select: {
        id: true,
        title: true,
        duration: true,
        priority: true,
        startTime: true
      }
    });
    
    console.log(`   Database contains: ${dbTasks.length} tasks`);
    if (dbTasks.length > 0) {
      dbTasks.forEach((task, i) => {
        console.log(`   ${i + 1}. "${task.title}" (${task.duration}min, ${task.priority})`);
        console.log(`      ID: ${task.id}`);
      });
    }

    // Success/Failure Analysis
    console.log('\n🎯 Analysis:');
    if (result.tasks?.length > 0 && dbTasks.length > 0) {
      console.log('   ✅ SUCCESS: Both response and database have tasks');
    } else if (dbTasks.length > 0 && !result.tasks?.length) {
      console.log('   ⚠️ PARTIAL: Database has tasks but response is empty');
    } else if (result.tasks?.length > 0 && dbTasks.length === 0) {
      console.log('   ⚠️ PARTIAL: Response has tasks but database is empty');
    } else {
      console.log('   ❌ FAILURE: No tasks in response or database');
    }

  } catch (error: any) {
    console.error('❌ Test Error:', error?.message || String(error));
    
    // Check for common issues
    if (error?.message?.includes('API')) {
      console.log('💡 Likely API issue - check Google AI API key and quota');
    } else if (error?.message?.includes('database') || error?.message?.includes('prisma')) {
      console.log('💡 Database connection issue');
    } else {
      console.log('💡 Unknown error - check the full error above');
    }
  }
}

testTaskCreation();