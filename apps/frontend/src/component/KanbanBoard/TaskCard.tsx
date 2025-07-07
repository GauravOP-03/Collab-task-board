import React, { useRef } from 'react';
import { Trash2, Calendar } from 'lucide-react';
import type { Task } from '../../types/KanbanBoardTypes';
import "../../styles/TaskCards.css";

interface Props {
    task: Task;
    onDragStart: () => void;
    deleteTask: (taskId: string) => void;
    onClick: () => void;
}

const TaskCard: React.FC<Props> = ({ task, onDragStart, deleteTask, onClick }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return '#EF4444'; // Red
            case 'medium':
                return '#F59E0B'; // Amber
            case 'low':
                return '#10B981'; // Green
            default:
                return '#64748B'; // Gray
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        onDragStart();
        if (cardRef.current) {
            const dragImage = cardRef.current.cloneNode(true) as HTMLElement;
            dragImage.style.transform = 'none';
            dragImage.style.boxShadow = 'none';
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-9999px';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 0, 0);
        }
    };

    const handleDragEnd = () => {
        const clones = document.querySelectorAll(".drag-clone");
        clones.forEach(node => node.remove());
    };

    return (
        <div
            ref={cardRef}
            className="task-card"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={onClick}
        >
            <div className="task-card-header">
                <div className="priority-dot" style={{ backgroundColor: getPriorityColor(task.priority) }} />
                <h3 className="task-title">{task.title}</h3>
                <button
                    className="delete-btn"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent modal open
                        deleteTask(task._id);
                    }}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <p className="task-description">{task.description}</p>

            <div className="task-tags">
                {task.tags.map(tag => (
                    <span key={tag} className="tag-pill">
                        #{tag}
                    </span>
                ))}
            </div>

            <div className="task-footer">
                <div className="assignees">
                    {task.assignees.map(user => (
                        <div
                            key={user._id}
                            className="assignee-avatar"
                            title={user.username}
                        >
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    ))}
                </div>
                <div className="due-date">
                    <Calendar size={14} /> {new Date(task.dueDate).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
