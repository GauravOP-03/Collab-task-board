import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { User, Task } from '../../types/KanbanBoardTypes';

interface Props {
    users: User[];
    onClose: () => void;
    onAddTask: (task: Task) => void;
}

const AddTaskModal: React.FC<Props> = ({ users, onClose, onAddTask }) => {
    const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'createdAt'>>({
        title: '',
        description: '',
        assignees: [],
        priority: 'medium',
        dueDate: '',
        tags: [],
        column: 'todo',
    });

    const handleSubmit = () => {
        if (!newTask.title.trim()) return;
        const task: Task = {
            ...newTask,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split('T')[0],
        };
        onAddTask(task);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add New Task</h2>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <input
                        type="text"
                        placeholder="Task title"
                        value={newTask.title}
                        onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <textarea
                        placeholder="Description"
                        value={newTask.description}
                        onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={e => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                    <button onClick={handleSubmit} className="button button-add">
                        Add Task
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTaskModal;
