import React, { useState, useRef } from 'react';
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
    const [isDragging, setIsDragging] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return '#EF4444';
            case 'medium':
                return '#F59E0B';
            case 'low':
                return '#10B981';
            default:
                return '#64748B';
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        setIsDragging(true);
        onDragStart();

        // 🪞 Clone front face for drag image
        if (cardRef.current) {
            const dragImage = cardRef.current.cloneNode(true) as HTMLElement;
            dragImage.style.transform = 'none'; // remove any rotation
            dragImage.style.boxShadow = 'none';
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-9999px'; // hide offscreen
            document.body.appendChild(dragImage);

            e.dataTransfer.setDragImage(dragImage, 0, 0);

            // Clean up after drag ends
            setTimeout(() => {
                document.body.removeChild(dragImage);
            }, 0);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <div
            ref={cardRef}
            className={`task-card ${isDragging ? 'no-flip' : ''}`}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={onClick}
        >
            <div className="card-inner">
                {/* Front Side */}
                <div className="card-front">
                    <div className="task-card-header">
                        <h3 className="task-title">{task.title}</h3>
                        <div className="task-actions">
                            <div
                                className="priority-dot"
                                style={{ backgroundColor: getPriorityColor(task.priority) }}
                            />
                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(task._id);
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>

                    <p className="task-description">{task.description}</p>

                    <div className="task-tags">
                        {task.tags.map(tag => (
                            <span key={tag} className="tag-pill">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="task-assignees">
                        {task.assignees.map(user => (
                            <div
                                key={user._id}
                                className="assignee-avatar"
                                title={user.username}
                                style={{ backgroundColor: '#007bff' }}
                            >
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Back Side */}
                <div className="card-back">
                    <div className="task-meta">
                        <div className="meta-item">
                            <span>Assigned By:</span> {task.assignedBy.username}
                        </div>
                        <div className="meta-item">
                            <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        <div className="meta-item">
                            Created: {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                        <div className="meta-item">
                            Updated: {new Date(task.updatedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
