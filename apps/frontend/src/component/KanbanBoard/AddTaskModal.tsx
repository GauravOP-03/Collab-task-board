import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react'; // Loader2 for spinner
import type { User, TaskInput } from '../../types/KanbanBoardTypes';
import "../../styles/AddTaskModel.css";

interface Props {
    users: User[];
    onClose: () => void;
    onAddTask: (task: Partial<TaskInput>) => Promise<void>;
}

const AddTaskModal: React.FC<Props> = ({ users, onClose, onAddTask }) => {
    const [newTask, setNewTask] = useState<Partial<TaskInput>>({
        title: '',
        description: '',
        assignees: [],
        priority: 'medium',
        dueDate: '',
        tags: [],
        column: 'todo',
    });
    const [loading, setLoading] = useState(false); // ✅ loading state

    const handleSubmit = async () => {
        if (!newTask.title || !newTask.title.trim() || loading) return; // prevent double submit

        setLoading(true);
        try {
            const payload: Partial<TaskInput> = {
                ...newTask,
                assignees: (newTask.assignees as string[]), // IDs only
            };

            await onAddTask(payload); // API call
            onClose();
        } catch (err) {
            console.error('Failed to add task:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAssignee = (user: User) => {
        setNewTask(prev => {
            const assignees = prev.assignees as string[];
            const alreadyAssigned = assignees.includes(user._id);
            const updatedAssignees = alreadyAssigned
                ? assignees.filter(id => id !== user._id)
                : [...assignees, user._id];

            return { ...prev, assignees: updatedAssignees };
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add New Task</h2>
                    <button
                        onClick={onClose}
                        className="modal-close-btn"
                        disabled={loading} // ✅ disable close during loading
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <label>Task Title</label>
                    <input
                        type="text"
                        placeholder="Enter task title"
                        value={newTask.title}
                        onChange={e =>
                            setNewTask(prev => ({ ...prev, title: e.target.value }))
                        }
                        disabled={loading} // ✅ disable inputs while loading
                    />

                    <label>Description</label>
                    <textarea
                        placeholder="Enter description"
                        value={newTask.description}
                        onChange={e =>
                            setNewTask(prev => ({ ...prev, description: e.target.value }))
                        }
                        disabled={loading}
                    />

                    <label>Due Date</label>
                    <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={e =>
                            setNewTask(prev => ({ ...prev, dueDate: e.target.value }))
                        }
                        disabled={loading}
                    />

                    <label>Assign Users</label>
                    <div className="user-list">
                        {users.map(user => {
                            const isSelected = (newTask.assignees as string[]).includes(user._id);
                            return (
                                <div
                                    key={user._id}
                                    className={`user-chip ${isSelected ? 'selected' : ''}`}
                                    onClick={() => !loading && toggleAssignee(user)} // ✅ disable click during loading
                                >
                                    <div className="avatar">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{user.username}</span>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="button-add"
                        disabled={loading} // ✅ disable button while loading
                    >
                        {loading ? (
                            <span className="loading-flex">
                                <Loader2 size={16} className="spin" /> Adding...
                            </span>
                        ) : (
                            "Add Task"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTaskModal;
