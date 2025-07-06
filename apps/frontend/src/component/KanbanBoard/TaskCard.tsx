import React from 'react';
import { Edit2, Trash2, Calendar } from 'lucide-react';
import type { Task } from '../../types/KanbanBoardTypes';

interface Props {
    task: Task;
    onDragStart: () => void;
    deleteTask: (taskId: string) => void;
}

const TaskCard: React.FC<Props> = ({ task, onDragStart, deleteTask }) => {
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

    return (
        <div
            className="task-card"
            draggable
            onDragStart={onDragStart}
        >
            <div className="task-card-header">
                <h3 className="task-title">{task.title}</h3>
                <div className="task-actions">
                    <div
                        className="priority-dot"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                    />
                    <button>
                        <Edit2 size={12} />
                    </button>
                    <button onClick={() => deleteTask(task._id)}>
                        <Trash2 size={12} color="#EF4444" />
                    </button>
                </div>
            </div>
            <p>{task.description}</p>
            <div>
                {task.tags.map(tag => (
                    <span key={tag} className="tag-pill">
                        {tag}
                    </span>
                ))}
            </div>
            <div>
                {task.assignees.map(user => (
                    <div
                        key={user._id}
                        className="assignee-avatar"
                        title={user.name}
                    >
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                ))}
                <div>
                    <Calendar size={12} />
                    {new Date(task.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
