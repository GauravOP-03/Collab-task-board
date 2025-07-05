import React from 'react';
import type { Column as ColumnType, Task } from '../../types/KanbanBoardTypes';
import TaskCard from './TaskCard';

interface Props {
    column: ColumnType;
    onDragStart: (task: Task) => void;
    onDrop: (columnId: string) => void;
    draggedOver: string | null;
    setDraggedOver: React.Dispatch<React.SetStateAction<string | null>>;
    deleteTask: (taskId: string) => void;
}

const Column: React.FC<Props> = ({
    column,
    onDragStart,
    onDrop,
    draggedOver,
    setDraggedOver,
    deleteTask,
}) => (
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
                draggedOver === column.id ? '2px dashed #10B981' : undefined,
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
                key={task.id}
                task={task}
                onDragStart={() => onDragStart(task)}
                deleteTask={deleteTask}
            />
        ))}
    </div>
);

export default Column;
