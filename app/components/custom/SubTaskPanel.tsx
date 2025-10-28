"use client";
import { useMemo } from "react";
import useSchedule from "@/zustand/useSchedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Circle } from "lucide-react";

export default function SubTaskPanel() {
  const { tasks, subTasks, updateSubTask } = useSchedule();

  // Group subtasks by their associated tasks
  const groupedSubTasks = useMemo(() => {
    const groups: { [taskId: string]: { task: TaskType; subTasks: SubTaskType[] } } = {};
    
    subTasks.forEach((subTask) => {
      const task = tasks.find((t) => t.id === subTask.taskId);
      if (task) {
        if (!groups[task.id]) {
          groups[task.id] = { task, subTasks: [] };
        }
        groups[task.id].subTasks.push(subTask);
      }
    });
    
    return Object.values(groups);
  }, [tasks, subTasks]);

  const toggleSubTask = async (id: string, isCompleted: boolean) => {
    await updateSubTask(id, !isCompleted);
  };

  if (groupedSubTasks.length === 0) {
    return (
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Sub-Tasks</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Circle className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-2 text-sm text-zinc-400">No sub-tasks available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800 bg-zinc-950">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Sub-Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedSubTasks.map(({ task, subTasks: taskSubTasks }) => {
          const completedCount = taskSubTasks.filter((st) => st.isCompleted).length;
          const totalCount = taskSubTasks.length;
          const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div key={task.id} className="space-y-3">
              {/* Task Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">{task.title}</h3>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    completionPercentage === 100 
                      ? "bg-green-900/50 text-green-300 border-green-700/60"
                      : completionPercentage >= 50
                      ? "bg-yellow-900/50 text-yellow-300 border-yellow-700/60" 
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  {completedCount}/{totalCount} ({completionPercentage}%)
                </Badge>
              </div>

              {/* Sub-Tasks List */}
              <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                {taskSubTasks.map((subTask) => (
                  <div key={subTask.id} className="flex items-center gap-3 group">
                    <Checkbox
                      id={`panel-subtask-${subTask.id}`}
                      checked={subTask.isCompleted}
                      onCheckedChange={() => toggleSubTask(subTask.id!, subTask.isCompleted)}
                    />
                    <div className="flex-1 flex items-center gap-2">
                      {subTask.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-zinc-500" />
                      )}
                      <label
                        htmlFor={`panel-subtask-${subTask.id}`}
                        className={`text-sm cursor-pointer ${
                          subTask.isCompleted 
                            ? "text-zinc-500 line-through" 
                            : "text-zinc-300 group-hover:text-white"
                        }`}
                      >
                        {subTask.description}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}