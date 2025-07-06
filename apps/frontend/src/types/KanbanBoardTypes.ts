export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
}

export type Task = {
  _id: string;
  title: string;
  description: string;
  assignees: User[];
  assignedBy: User;
  priority: "high" | "medium" | "low";
  dueDate: string;
  tags: string[];
  column: "todo" | "inprogress" | "done";
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  _id?: string;
  title: string;
  description: string;
  assignees: string[];
  priority: "high" | "medium" | "low";
  dueDate: string;
  tags: string[];
  column: "todo" | "inprogress" | "done";
};

export interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}
