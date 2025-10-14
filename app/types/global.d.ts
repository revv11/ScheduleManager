

type TaskType = {
    id: string,
    title: string,
    duration: number,
    startTime: Date,
    priority: Priority,
}

type Priority = "HIGH" | "MEDIUM" | "LOW";

type SubTaskType = {
    id: string,
    taskId: string,
    isCompleted: boolean,
    description: string,
}

type Message = {
  id? : string;
  role: Role;
  content: string,
  createdAt?: Date;
}
