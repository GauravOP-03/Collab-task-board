import React, { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import Column from './Column';
import AddTaskModal from './AddTaskModal';
import type { User, Column as ColumnType, Task, TaskInput } from '../../types/KanbanBoardTypes';
import axiosInstance from '../../lib/axiosInstance';
import '../../styles/KanbanBoard.css';
import { useSocket } from "../../context/socket/useSocket"
import { useAuth } from "../../context/auth/useAuth"
import toast from 'react-hot-toast';
import Navbar from '../Navbar';
import ConflictResolver from './ConflictResolver';
import type { AxiosError } from 'axios';
import LogSheet from './LogSheets';

// Move column metadata outside component to avoid re-creation
const columnMetadata: ColumnType[] = [
    { id: "todo", title: "To Do", color: "#FF5733", tasks: [] },
    { id: "inprogress", title: "In Progress", color: "#33A1FF", tasks: [] },
    { id: "done", title: "Done", color: "#28A745", tasks: [] },
];

const KanbanBoard: React.FC = () => {
    const { socket, loading: socketLoading } = useSocket();
    const { user } = useAuth();

    const [columns, setColumns] = useState<ColumnType[]>(columnMetadata);
    const [users, setUsers] = useState<User[]>([]);
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [draggedOver, setDraggedOver] = useState<string | null>(null);
    const [showAddTask, setShowAddTask] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [conflictDetected, setConflictDetected] = useState(false);
    const showConnection = useRef(false);

    // Load tasks and users
    useEffect(() => {
        (async () => {
            try {
                const [{ data: tasksResp }, { data: usersResp }] = await Promise.all([
                    axiosInstance.get('/tasks'),
                    axiosInstance.get('/users')
                ]);

                const tasks: Task[] = tasksResp.data || [];
                const updatedColumns = columnMetadata.map(col => ({
                    ...col,
                    tasks: tasks.filter(t => t.column === col.id),
                }));
                setColumns(updatedColumns);
                setUsers(usersResp.users);
            } catch {
                // console.error(e);
                toast.error("Failed to load board data.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // Socket setup
    useEffect(() => {
        if (!socket || socketLoading || !user?._id) {
            if (!showConnection.current) {
                toast('Waiting for connection to server...', { icon: '⏳' });
                showConnection.current = true;
            }
            return;
        }

        // Join room (once)
        socket.emit('joinBoard', 'kanban-board');


        const handleTaskCreated = (newTask: Task) => {
            // console.log(newTask)
            if (newTask.assignees.some(a => a['_id'] === user?._id) || newTask.assignedBy._id === user?._id) {
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
                toast.success(`Task "${newTask.title}" created by ${newTask.assignedBy.username}, { icon: '✅' }`);
            }
        };

        const handleTaskUpdated = (updatedTask: Task) => {
            if (updatedTask.assignees.some(a => a._id === user?._id) || updatedTask.assignedBy._id === user?._id) {
                setColumns(prev =>
                    prev.map(col => ({
                        ...col,
                        tasks: col.tasks.map(t => t._id === updatedTask._id ? updatedTask : t)
                    }))
                );
                toast.success(`Task "${updatedTask.title}" updated by ${updatedTask.assignedBy.username}`, { icon: '✅' });
            }
        };

        const handleTaskDeleted = (taskId: string) => {
            // console.log('Task deleted:', taskId);
            setColumns(prev =>
                prev.map(col => ({
                    ...col,
                    tasks: col.tasks.filter(t => t._id !== taskId)
                }))
            );
        };

        const handleUpdateColumn = async (task: { column: String, draggedTask: Task }) => {
            const { column, draggedTask } = task;

            setColumns(prev =>
                prev.map(col => ({
                    ...col,
                    tasks: col.tasks.filter(t => t._id !== draggedTask._id)
                }))
            );
            setColumns(prev =>
                prev.map(col =>
                    col.id === column
                        ? { ...col, tasks: [...col.tasks, { ...draggedTask, column: column as Task["column"] }] }
                        : col
                )
            );


        };




        // Attach listeners
        socket.on('task-created', handleTaskCreated);
        socket.on('task-updated', handleTaskUpdated);
        socket.on('task-deleted', handleTaskDeleted);
        socket.on('update-column', handleUpdateColumn);

        // Cleanup
        return () => {
            socket.off('task-created', handleTaskCreated);
            socket.off('task-updated', handleTaskUpdated);
            socket.off('task-deleted', handleTaskDeleted);
            socket.off('update-column', handleUpdateColumn);
        };
    }, [socket, socketLoading, user?._id]);


    const handleDragStart = (task: Task) => {
        setDraggedTask(task);
    };

    const handleDrop = async (newColumnId: string) => {
        if (!draggedTask || draggedTask.column === newColumnId) {
            setDraggedTask(null);
            setDraggedOver(null);
            return;
        }

        // Optimistic UI update
        const prevColumns = [...columns];
        setColumns(prev =>
            prev.map(col => ({
                ...col,
                tasks: col.tasks.filter(t => t._id !== draggedTask._id)
            }))
        );
        setColumns(prev =>
            prev.map(col =>
                col.id === newColumnId
                    ? { ...col, tasks: [...col.tasks, { ...draggedTask, column: newColumnId as Task["column"] }] }
                    : col
            )
        );

        console.log(draggedTask)

        try {
            await axiosInstance.patch(`/tasks/${draggedTask._id}/column`, { column: newColumnId });
            socket?.emit("update-column", { column: newColumnId, draggedTask });
            toast.success("Task moved successfully!");

        } catch (e) {
            console.error(e);
            toast.error("Failed to move task. Reverting changes.");
            setColumns(prevColumns); // rollback
        } finally {
            setDraggedTask(null);
            setDraggedOver(null);
        }
    };

    const addTask = async (task: Partial<TaskInput>) => {
        // console.log(task)
        try {
            const res = await axiosInstance.post(`/tasks`, task);
            socket?.emit("task-created", res.data.data);
            // toast.success(`Task "${res.data.data.title}" added successfully!`, { icon: '✅' });
        } catch (e) {
            console.error("Error adding task:", e);
            toast.error("Failed to add task.");
        }
        setShowAddTask(false);
    };

    const [clientVersion, setClientVersion] = useState<TaskInput>();
    const [serverVersion, setServerVersion] = useState<Task>()

    const editTask = async (task: Partial<TaskInput>) => {
        console.log(task)
        try {
            const res = await axiosInstance.put(`/tasks/${task._id}`, task);
            setConflictDetected(false);
            socket?.emit("task-updated", res.data.data);
        } catch (e) {
            // console.error("Error editing task", e);
            const err = e as AxiosError<{ message: string, clientVersion: TaskInput, serverVersion: Task }>;
            if (err.response?.status === 409) {
                setClientVersion(err.response.data.clientVersion);
                setServerVersion(err.response.data.serverVersion);
                setConflictDetected(true);
            }
            toast.error(err.response?.data?.message || "Failed to update task.");
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            await axiosInstance.delete(`/tasks/${taskId}`);
            toast.success("Task deleted successfully!", { icon: '✅' });
            socket?.emit("task-deleted", taskId);
        } catch (e) {
            console.error("Error deleting task:", e);
            toast.error("Failed to delete task.");
        }
    };

    const smartAssign = async () => {
        try {
            const res = await axiosInstance.get('/tasks/smartAssign');
            return res.data;
        } catch (e) {
            console.error("Error in Smart Assign", e);
            toast.error("Smart Assign failed.");
        }
    };

    const onResolve = async (task: Partial<TaskInput>) => {
        try {
            const res = await axiosInstance.put(`tasks/conflict/${task._id}`, task);
            setConflictDetected(false);
            socket?.emit("task-updated", res.data.data);
            // console.log("updated from fun", res.data.data)
        } catch (e) {

            console.error("Error editing task", e);
        }
    }

    if (isLoading) {
        return (
            <div className="loading-board">
                <div className="spinner"></div>
                <p>Loading Kanban Board...</p>
            </div>
        );
    }


    return (
        <>
            <Navbar />

            {conflictDetected && clientVersion && serverVersion && <ConflictResolver clientVersion={clientVersion} serverVersion={serverVersion} onResolve={onResolve} users={users} />}

            <div className="board-container">
                <div className="board-header">
                    <h1 className="board-title">Collab Task Board</h1>
                    {/* <button
                    className="button button-add"
                    onClick={() => setShowAddTask(true)}
                >
                    <Plus size={16} /> Add Task
                </button> */}
                </div>

                <div className="columns-grid">
                    {columns.map(col => (
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

                <div className="fab-logs">
                    <LogSheet />
                </div>

                <div
                    className="fab-add-task"
                    onClick={() => setShowAddTask(true)}
                >
                    <Plus size={28} />
                </div>
            </div>
        </>
    );
};

export default KanbanBoard;
