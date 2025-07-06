import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Column from './Column';
import AddTaskModal from './AddTaskModal';
import type { User, Column as ColumnType, Task, TaskInput } from '../../types/KanbanBoardTypes';
import axiosInstance from '../../lib/axiosInstance';
import '../../styles/KanbanBoard.css';

const KanbanBoard: React.FC = () => {
    const columnMetadata: ColumnType[] = React.useMemo(() => [
        { id: "todo", title: "To Do", color: "#FF5733", tasks: [] },
        { id: "inprogress", title: "In Progress", color: "#33A1FF", tasks: [] },
        { id: "done", title: "Done", color: "#28A745", tasks: [] },
    ], []);

    const [columns, setColumns] = useState<ColumnType[]>(columnMetadata);

    const [users, setUsers] = useState<User[]>([]);
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [draggedOver, setDraggedOver] = useState<string | null>(null);
    const [showAddTask, setShowAddTask] = useState(false);

    // fetch columns & users
    useEffect(() => {
        (async () => {
            try {
                const { data: tasksResp } = await axiosInstance.get('/tasks');
                console.log(tasksResp.data);
                const tasks: Task[] = tasksResp.data;

                // Group tasks into columns
                const updatedColumns = columnMetadata.map(col => ({
                    ...col,
                    tasks: tasks.filter(t => t.column === col.id),
                }));
                setColumns(updatedColumns);

                const { data: usersResp } = await axiosInstance.get('/users');
                console.log(usersResp);
                setUsers(usersResp.users);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [columnMetadata]);

    const handleDragStart = (task: Task) => {
        setDraggedTask(task);
    };

    const handleDrop = async (newColumnId: string) => {
        if (!draggedTask || draggedTask.column === newColumnId) {
            setDraggedTask(null);
            setDraggedOver(null);
            return;
        }

        try {
            // update on server
            await axiosInstance.patch(`/tasks/${draggedTask._id}/column`, {
                column: newColumnId
            });

            // re-fetch grouped columns
            const { data: tasksResp } = await axiosInstance.get('/tasks');
            const tasks: Task[] = tasksResp.data;

            const updatedColumns = columnMetadata.map(col => ({
                ...col,
                tasks: tasks.filter(t => t.column === col.id),
            }));

            setColumns(updatedColumns);
        } catch (e) {
            console.error(e);
        } finally {
            setDraggedTask(null);
            setDraggedOver(null);
        }
    };

    const addTask = async (task: Partial<TaskInput>) => {
        // open AddTaskModal will POST new task and then:
        try {

            const res = await axiosInstance.post(`/tasks`, task);

            setColumns(prev => prev.map(col =>
                col.id === res.data.column
                    ? { ...col, tasks: [...col.tasks, res.data] }
                    : col
            ));
        } catch (e) {
            console.error("Error adding task:", e);
        }
        setShowAddTask(false);
    };

    const deleteTask = async (taskId: string) => {
        try {
            await axiosInstance.delete(`/tasks/${taskId}`);

            setColumns(prev => prev.map(col => ({
                ...col,
                tasks: col.tasks.filter(t => t._id !== taskId)
            })));
        } catch (e) {
            console.error("Error deleting task:", e);
        }
    };

    return (
        <div className="board-container">
            <div className="board-header">
                <h1 className="board-title">Project Kanban Board</h1>
                <div>
                    <button
                        className="button button-add"
                        onClick={() => setShowAddTask(true)}
                    >
                        <Plus size={16} /> Add Task
                    </button>
                </div>
            </div>

            <div className="columns-grid">
                {columns && columns.length > 0 && columns.map(col => (
                    <Column
                        key={col.id}
                        column={col}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        draggedOver={draggedOver}
                        setDraggedOver={setDraggedOver}
                        deleteTask={deleteTask}
                    />
                ))}
            </div>

            {showAddTask && (
                <AddTaskModal
                    users={users}
                    onClose={() => setShowAddTask(false)}
                    onAddTask={addTask}
                />
            )}
        </div>
    );
};

export default KanbanBoard;
