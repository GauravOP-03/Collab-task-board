import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Column from './Column';
import AddTaskModal from './AddTaskModal';
import type { User, Column as ColumnType, Task, TaskInput } from '../../types/KanbanBoardTypes';
import axiosInstance from '../../lib/axiosInstance';
import '../../styles/KanbanBoard.css';
import { useSocket } from "../../context/socket/useSocket"
import { useAuth } from "../../context/auth/useAuth"

const KanbanBoard: React.FC = () => {

    const { socket, loading } = useSocket();
    const { user } = useAuth();
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



    useEffect(() => {
        console.log(socket)
        if (!socket || loading) {
            console.log("Waiting for socket to initialize...");
            return;
        }
        socket.emit('joinBoard', 'kanban-board');
        // Listen for task updates
        socket.on('task-created', (newTask: Task) => {
            // console.log("working")
            if (newTask.assignees.some(a => a['_id'] === user?._id)) {
                setColumns(prev =>
                    prev.map(col => {
                        if (col.id === newTask.column) {
                            return {
                                ...col,
                                tasks: [...col.tasks, newTask],
                            };
                        }
                        return col;
                    })
                );
            }
            console.log(newTask)


        });

        socket.on('task-updated', (updatedTask: Task) => {
            console.log("task updated")
            if (updatedTask.assignees.some(a => a['_id'] === user?._id)) {

                setColumns(prev =>
                    prev.map(col => ({
                        ...col,
                        tasks: col.tasks.map(t => t._id === updatedTask._id ? updatedTask : t)
                    }))
                );
            }
        });

        // Listen for task deletion
        socket.on('task-deleted', (taskId: string) => {

            setColumns(prev =>
                prev.map(col => ({
                    ...col,
                    tasks: col.tasks.filter(t => t._id !== taskId)
                }))
            );
        });

        socket.on('update-column', (tasks: Task[]) => {
            const updatedColumns = columnMetadata.map(col => ({
                ...col,
                tasks: tasks.filter(t => t.column === col.id),
            }));

            setColumns(updatedColumns);
        })



        return () => {
            socket.off('task-updated');
            socket.off('task-deleted');
            socket.off('task-created');
            socket.off('update-column')
        };
    }, [columnMetadata, loading, socket, user?._id])




    // fetch columns & users
    useEffect(() => {
        (async () => {
            try {
                const { data: tasksResp } = await axiosInstance.get('/tasks');
                // console.log(tasksResp.data);
                const tasks: Task[] = tasksResp.data || [];

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
            socket?.emit("update-column", tasks)
        } catch (e) {
            console.error(e);
        } finally {
            setDraggedTask(null);
            setDraggedOver(null);
        }
    };

    const addTask = async (task: Partial<TaskInput>) => {
        try {
            const res = await axiosInstance.post(`/tasks`, task);

            setColumns(prev =>
                prev.map(col => {
                    if (col.id === res.data.data.column) {
                        return {
                            ...col,
                            tasks: [...col.tasks, res.data.data],
                        };
                    }
                    return col;
                })
            );

            socket?.emit("task-created", res.data.data);
        } catch (e) {
            console.error("Error adding task:", e);
        }
        setShowAddTask(false);
    };


    const editTask = async (task: Partial<TaskInput>) => {

        try {
            const res = await axiosInstance.put(`/tasks/${task._id}`, task);
            console.log(res.data.data);
            setColumns(prev => prev.map(col => ({
                ...col,
                tasks: col.tasks.map(t => t._id === task._id ? res.data.data : t)
            })));
            // console.log(task.data.data)

        } catch (e) {
            console.error("Error editing task", e);
        }
    }

    const deleteTask = async (taskId: string) => {
        try {
            await axiosInstance.delete(`/tasks/${taskId}`);

            setColumns(prev => prev.map(col => ({
                ...col,
                tasks: col.tasks.filter(t => t._id !== taskId)
            })));
            socket?.emit("task-deleted", taskId);
        } catch (e) {
            console.error("Error deleting task:", e);
        }
    };

    const smartAssign = async () => {
        try {
            const res = await axiosInstance.get('/tasks/smartAssign');
            console.log(res.data);
            return res.data;
        } catch (e) {
            console.error("Error in Smart Assign", e);
        }
    }

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
                        editTask={editTask}
                        users={users}
                    />
                ))}
            </div>

            {showAddTask && (
                <AddTaskModal
                    users={users}
                    onClose={() => setShowAddTask(false)}
                    onAddTask={addTask}
                    smartAssign={smartAssign}
                />
            )}
        </div>
    );
};

export default KanbanBoard;
