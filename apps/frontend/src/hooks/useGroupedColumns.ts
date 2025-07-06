// hooks/useGroupedColumns.ts
import { useMemo } from "react";
import type { Task, Column } from "../types/KanbanBoardTypes";

export function useGroupedColumns(tasks: Task[]): Column[] {
  return useMemo(
    () => [
      {
        id: "todo",
        title: "To Do",
        color: "#FF5733",
        tasks: tasks.filter((task) => task.column === "todo"),
      },
      {
        id: "inprogress",
        title: "In Progress",
        color: "#33A1FF",
        tasks: tasks.filter((task) => task.column === "inprogress"),
      },
      {
        id: "done",
        title: "Done",
        color: "#28A745",
        tasks: tasks.filter((task) => task.column === "done"),
      },
    ],
    [tasks]
  );
}
