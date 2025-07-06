import React, { useState, type KeyboardEvent } from "react";
import { X, Loader2 } from "lucide-react";
import type { User, TaskInput } from "../../types/KanbanBoardTypes";
import "../../styles/AddTaskModal.css";

interface Props {
    users: User[];
    onClose: () => void;
    onAddTask: (task: Partial<TaskInput>) => Promise<void>;
}

const AddTaskModal: React.FC<Props> = ({ users, onClose, onAddTask }) => {
    const [newTask, setNewTask] = useState<Partial<TaskInput>>({
        title: "",
        description: "",
        assignees: [],
        priority: "medium",
        dueDate: "",
        tags: [],
        column: "todo",
    });
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState("");

    const handleSubmit = async () => {
        if (!newTask.title?.trim() || loading) return;

        setLoading(true);
        try {
            await onAddTask({
                ...newTask,
                assignees: newTask.assignees as string[], // only IDs
            });
            onClose();
        } catch (err) {
            console.error("Failed to add task:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAssignee = (user: User) => {
        setNewTask(prev => {
            const assignees = prev.assignees as string[];
            const updated = assignees.includes(user._id)
                ? assignees.filter(id => id !== user._id)
                : [...assignees, user._id];
            return { ...prev, assignees: updated };
        });
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
            e.preventDefault();
            const trimmedTag = tagInput.trim();
            if (!(newTask.tags as string[]).includes(trimmedTag)) {
                setNewTask(prev => ({
                    ...prev,
                    tags: [...(prev.tags as string[]), trimmedTag],
                }));
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setNewTask(prev => ({
            ...prev,
            tags: (prev.tags as string[]).filter(tag => tag !== tagToRemove),
        }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add New Task</h2>
                    <button
                        onClick={onClose}
                        className="modal-close-btn"
                        disabled={loading}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Title */}
                    <label>Task Title</label>
                    <input
                        type="text"
                        placeholder="Enter task title"
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        disabled={loading}
                        style={{ width: '95%' }}
                    />

                    {/* Description */}
                    <label>Description</label>
                    <textarea
                        placeholder="Enter description"
                        value={newTask.description}
                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        disabled={loading}
                        style={{ width: '95%' }}
                    />

                    {/* Due Date */}
                    <label>Due Date</label>
                    <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                        disabled={loading}
                        style={{ width: '95%' }}
                    />

                    {/* Priority */}
                    <label>Priority</label>
                    <select
                        value={newTask.priority}
                        onChange={e => setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })}
                        disabled={loading}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>

                    {/* Tags */}
                    <label>Tags</label>
                    <div className="tags-container">
                        {(newTask.tags as string[]).map(tag => (
                            <div key={tag} className="tag-chip">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    disabled={loading}
                                    aria-label={`Remove tag ${tag}`}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <input
                            type="text"
                            placeholder="Type and press Enter"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            disabled={loading}
                        />
                    </div>

                    {/* Assignees */}
                    <label>Assign Users</label>
                    <div className="user-list">
                        {users.map(user => {
                            const selected = (newTask.assignees as string[]).includes(user._id);
                            return (
                                <div
                                    key={user._id}
                                    className={`user-chip ${selected ? "selected" : ""}`}
                                    onClick={() => !loading && toggleAssignee(user)}
                                >
                                    <div className="avatar">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{user.username}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        className="button-add"
                        disabled={loading}
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
