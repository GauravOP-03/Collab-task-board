export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export type Task = {
  id: string;
  title: string;
  description: string;
  assignees: User[];
  priority: "high" | "medium" | "low";
  dueDate: string;
  tags: string[];
  column: "todo" | "inprogress" | "done";
  createdAt: string;
};
export interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}
