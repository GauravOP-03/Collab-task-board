import React, { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import Column from './Column';
import AddTaskModal from './AddTaskModal';
import type { User, Task, Column as ColumnType } from '../../types/KanbanBoardTypes';
import '../../styles/KanbanBoard.css';

const KanbanBoard: React.FC = () => {
    const [users] = useState<User[]>([
        { id: '1', name: 'Alice Johnson', avatar: '👩‍💼', color: '#3B82F6' },
        { id: '2', name: 'Bob Smith', avatar: '👨‍💻', color: '#10B981' },
        { id: '3', name: 'Carol Davis', avatar: '👩‍🎨', color: '#F59E0B' },
        { id: '4', name: 'David Wilson', avatar: '👨‍🔬', color: '#EF4444' },
        { id: '5', name: 'Eva Brown', avatar: '👩‍🏫', color: '#8B5CF6' },
    ]);

    const [columns, setColumns] = useState<ColumnType[]>([
        {
            id: 'todo',
            title: 'To Do',
            color: '#64748B',
            tasks: [
                {
                    id: '1',
                    title: 'Design Homepage',
                    description: 'Create wireframes and mockups for the new homepage design',
                    assignees: [users[0], users[1]],
                    priority: 'high',
                    dueDate: '2024-12-15',
                    tags: ['Design', 'UI/UX'],
                    column: 'todo',
                    createdAt: '2024-12-01',
                },
                {
                    id: '2',
                    title: 'Setup Database',
                    description: 'Configure PostgreSQL database and create initial schema',
                    assignees: [users[1]],
                    priority: 'medium',
                    dueDate: '2024-12-10',
                    tags: ['Backend', 'Database'],
                    column: 'todo',
                    createdAt: '2024-12-02',
                },
            ],
        },
        {
            id: 'inprogress',
            title: 'In Progress',
            color: '#F59E0B',
            tasks: [
                {
                    id: '3',
                    title: 'API Development',
                    description: 'Implement REST API endpoints for user management',
                    assignees: [users[2], users[3]],
                    priority: 'high',
                    dueDate: '2024-12-20',
                    tags: ['Backend', 'API'],
                    column: 'inprogress',
                    createdAt: '2024-12-03',
                },
            ],
        },
        {
            id: 'done',
            title: 'Done',
            color: '#10B981',
            tasks: [
                {
                    id: '4',
                    title: 'Project Planning',
                    description: 'Define project scope and create timeline',
                    assignees: [users[0], users[4]],
                    priority: 'low',
                    dueDate: '2024-11-30',
                    tags: ['Planning', 'Management'],
                    column: 'done',
                    createdAt: '2024-11-25',
                },
            ],
        },
    ]);

    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [draggedOver, setDraggedOver] = useState<string | null>(null);
    const [showAddTask, setShowAddTask] = useState(false);

    const handleDragStart = (task: Task) => setDraggedTask(task);

    const handleDrop = (columnId: string) => {
        if (draggedTask && draggedTask.column !== columnId) {
            setColumns(prev =>
                prev.map(col =>
                    col.id === draggedTask.column
                        ? { ...col, tasks: col.tasks.filter(t => t.id !== draggedTask.id) }
                        : col.id === columnId
                            ? {
                                ...col,
                                tasks: [
                                    ...col.tasks,
                                    {
                                        ...draggedTask,
                                        column: columnId as Task['column']
                                    }
                                ]
                            }
                            : col
                )
            );
        }
        setDraggedTask(null);
        setDraggedOver(null);
    };

    const addTask = (task: Task) => {
        setColumns(prev =>
            prev.map(col =>
                col.id === task.column ? { ...col, tasks: [...col.tasks, task] } : col
            )
        );
    };

    const deleteTask = (taskId: string) => {
        setColumns(prev =>
            prev.map(col => ({
                ...col,
                tasks: col.tasks.filter(task => task.id !== taskId),
            }))
        );
    };

    return (
        <div className="board-container">
            <div className="board-header">
                <h1 className="board-title">Project Kanban Board</h1>
                <div>
                    <button className="button button-settings">
                        <Settings size={16} />
                        Settings
                    </button>
                    <button
                        className="button button-add"
                        onClick={() => setShowAddTask(true)}
                    >
                        <Plus size={16} />
                        Add Task
                    </button>
                </div>
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
