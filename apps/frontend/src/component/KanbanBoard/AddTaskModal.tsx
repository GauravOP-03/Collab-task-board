import React, { useState, type KeyboardEvent } from "react";
import { X, Loader2 } from "lucide-react";
import type { User, TaskInput } from "../../types/KanbanBoardTypes";
import "../../styles/AddTaskModal.css";

interface Props {
    users: User[];
    onClose: () => void;
    onAddTask: (task: Partial<TaskInput>) => Promise<void>;
    smartAssign: () => Promise<User>; // Added smartAssign prop
}

const AddTaskModal: React.FC<Props> = ({ users, onClose, onAddTask, smartAssign }) => {
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
    const [assigning, setAssigning] = useState(false); // Separate loader for Smart Assign
    const [tagInput, setTagInput] = useState("");

    const handleSubmit = async () => {
        if (!newTask.title?.trim() || loading || assigning) return;

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

    const handleSmartAssign = async () => {
        setAssigning(true);
        try {
            const suggestedUser = await smartAssign();
            if (!(newTask.assignees as string[]).includes(suggestedUser._id)) {
                setNewTask(prev => ({
                    ...prev,
                    assignees: [...(prev.assignees as string[]), suggestedUser._id],
                }));
                console.log(`Smart assigned to ${suggestedUser.username}`);
            } else {
                console.log(`${suggestedUser.username} is already assigned.`);
            }
        } catch (error) {
            console.error("Smart assign failed:", error);
        } finally {
            setAssigning(false);
        }
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
                        disabled={loading || assigning}
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
                        disabled={loading || assigning}
                        style={{ width: '95%' }}
                    />

                    {/* Description */}
                    <label>Description</label>
                    <textarea
                        placeholder="Enter description"
                        value={newTask.description}
                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        disabled={loading || assigning}
                        style={{ width: '95%' }}
                    />

                    {/* Due Date */}
                    <label>Due Date</label>
                    <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                        disabled={loading || assigning}
                        style={{ width: '95%' }}
                    />

                    {/* Priority */}
                    <label>Priority</label>
                    <select
                        value={newTask.priority}
                        onChange={e =>
                            setNewTask({
                                ...newTask,
                                priority: e.target.value as "low" | "medium" | "high",
                            })
                        }
                        disabled={loading || assigning}
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
                                    disabled={loading || assigning}
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
                            disabled={loading || assigning}
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
                                    onClick={() => !loading && !assigning && toggleAssignee(user)}
                                >
                                    <div className="avatar">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{user.username}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Smart Assign Button */}
                    <button
                        className="button-smart-assign"
                        onClick={handleSmartAssign}
                        disabled={loading || assigning}
                    >
                        {assigning ? (
                            <span className="loading-flex">
                                <Loader2 size={16} className="spin" /> Assigning...
                            </span>
                        ) : (
                            "Smart Assign"
                        )}
                    </button>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        className="button-add"
                        disabled={loading || assigning}
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
