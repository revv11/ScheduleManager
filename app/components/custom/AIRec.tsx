"use client";
import { useRef, useEffect, useState } from "react";
import useSchedule from "@/zustand/useSchedule";
import { Button } from "@/components/ui/button";
import { ListPlus, Plus } from "lucide-react";
import AICard from "./AICard";
import ManualTaskForm from "./ManualTaskForm";
import DashboardCard from "./DashboardCard";

function AIRec() {
  const { tasks, fetchTasks } = useSchedule();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

  const handleTaskCreated = () => {
    // Refresh tasks from API after successful creation
    fetchTasks();
    setShowAddTaskForm(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <DashboardCard
        title="AI Recommendations"
        actionButton={
          <Button
            size="sm"
            onClick={() => setShowAddTaskForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Task
          </Button>
        }
        contentClassName="flex flex-1 flex-col items-center justify-center gap-4 text-center"
      >
        {/* Manual Task Addition Form */}
        <ManualTaskForm 
          isOpen={showAddTaskForm}
          onClose={() => setShowAddTaskForm(false)}
          onSuccess={handleTaskCreated}
        />

        <ListPlus className="h-12 w-12 text-zinc-600" />
        <div className="space-y-1">
          <h3 className="font-semibold text-white">No tasks yet!</h3>
          <p className="text-sm text-zinc-400">
            Chat with the AI assistant to build your schedule.
          </p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="AI Recommendations"
      actionButton={
        <Button
          size="sm"
          onClick={() => setShowAddTaskForm(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Task
        </Button>
      }
      contentClassName="flex flex-col overflow-hidden p-0"
    >
      {/* Manual Task Addition Form */}
      <ManualTaskForm 
        isOpen={showAddTaskForm}
        onClose={() => setShowAddTaskForm(false)}
        onSuccess={handleTaskCreated}
      />

      {/* Task List Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-3 p-4">
          {tasks.map((task) => (
            <AICard key={task.id} task={task} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </DashboardCard>
  );
}

export default AIRec;