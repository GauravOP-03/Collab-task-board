import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { TaskInput, User } from "../../types/KanbanBoardTypes";
import "../../styles/EditTaskModal.css";

interface Props {
    task: Partial<TaskInput>;
    users: User[];
    onClose: () => void;
    onSave: (updatedTask: Partial<TaskInput>) => Promise<void>;
}

const EditTaskModal: React.FC<Props> = ({ task, users, onClose, onSave }) => {
    const [editedTask, setEditedTask] = useState<Partial<TaskInput>>({ ...task });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(editedTask);
            onClose();
        } catch (err) {
            console.error("Failed to save task:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAssignee = (userId: string) => {
        const exists = editedTask.assignees?.includes(userId);
        const updated = exists
            ? (editedTask.assignees as string[]).filter(id => id !== userId)
            : [...(editedTask.assignees || []), userId];
        setEditedTask({ ...editedTask, assignees: updated });
    };

    return (
        <div className="edit-modal-overlay">
            <div className="edit-modal-content">
                <div className="edit-modal-header">
                    <h2>Edit Task</h2>
                    <button
                        className="edit-modal-close-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="edit-modal-body">
                    {/* Title */}
                    <label>Title</label>
                    <input
                        type="text"
                        value={editedTask.title}
                        onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
                        disabled={loading}
                    />

                    {/* Description */}
                    <label>Description</label>
                    <textarea
                        value={editedTask.description}
                        onChange={e =>
                            setEditedTask({ ...editedTask, description: e.target.value })
                        }
                        disabled={loading}
                    />

                    {/* Priority */}
                    <label>Priority</label>
                    <select
                        value={editedTask.priority}
                        onChange={e => setEditedTask({ ...editedTask, priority: e.target.value as "low" | "medium" | "high" })}
                        disabled={loading}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>

                    {/* Due Date */}
                    <label>Due Date</label>
                    <input
                        type="date"
                        value={editedTask.dueDate ? editedTask.dueDate.slice(0, 10) : ""}
                        onChange={e => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                        disabled={loading}
                    />

                    {/* Assignees */}
                    <label>Assign Users</label>
                    <div className="edit-user-list">
                        {users.map(user => {
                            const selected = editedTask.assignees && editedTask.assignees.includes(user._id);
                            return (
                                <div
                                    key={user._id}
                                    className={`edit-user-chip ${selected ? "selected" : ""}`}
                                    onClick={() => !loading && toggleAssignee(user._id)}
                                >
                                    <div className="edit-avatar">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{user.username}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Save Button */}
                    <button
                        className="edit-save-btn"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="edit-loading-flex">
                                <Loader2 size={16} className="edit-spin" /> Saving...
                            </span>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTaskModal;
