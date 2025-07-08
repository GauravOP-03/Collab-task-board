import React, { useState } from 'react';
import type { Column as ColumnType, Task, TaskInput, User } from '../../types/KanbanBoardTypes';
import TaskCard from './TaskCard';
import EditTaskModal from './EditTaskModal';

interface Props {
    column: ColumnType;
    onDragStart: (task: Task) => void;
    onDrop: (columnId: string) => void;
    draggedOver: string | null;
    setDraggedOver: React.Dispatch<React.SetStateAction<string | null>>;
    deleteTask: (taskId: string) => void;
    editTask: (editedTask: Partial<TaskInput>) => Promise<void>;
    users: User[]
}

const Column: React.FC<Props> = ({
    column,
    onDragStart,
    onDrop,
    draggedOver,
    setDraggedOver,
    deleteTask,
    editTask,
    users
}) => {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const handleCardClick = (task: Task) => {
        setSelectedTask(task);
    };

    const handleModalClose = () => {
        setSelectedTask(null);
    };

    return (
        <>
            <div
                className="column-container"
                onDragOver={e => {
                    e.preventDefault();
                    setDraggedOver(column.id);
                }}
                onDragLeave={() => setDraggedOver(null)}
                onDrop={() => onDrop(column.id)}
                style={{
                    border:
                        draggedOver === column.id
                            ? '2px dashed #10B981'
                            : undefined,
                }}
            >
                <div className="column-header">
                    <h2 className="column-title">
                        <div
                            className="column-title-dot"
                            style={{ backgroundColor: column.color }}
                        />
                        {column.title}
                    </h2>
                    <span className="column-count">{column.tasks.length}</span>
                </div>
                {column.tasks.map(task => (
                    <TaskCard
                        key={task._id}
                        task={task}
                        onDragStart={() => onDragStart(task)}
                        deleteTask={deleteTask}
                        onClick={() => handleCardClick(task)}
                    />
                ))}
            </div>

            {selectedTask && selectedTask.assignees && (
                <EditTaskModal
                    task={{
                        ...selectedTask,
                        assignees: selectedTask.assignees.map(user =>
                            typeof user === 'string' ? user : user._id
                        ),
                    }}
                    users={users}
                    onClose={handleModalClose}
                    onSave={editTask}
                />
            )}
        </>
    );
};

export default Column;
