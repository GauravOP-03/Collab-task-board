import React, { useState } from 'react';
import '../../styles/ConflictResolver.css';
import type { Task, TaskInput, User } from '../../types/KanbanBoardTypes';

type Props = {
    serverVersion: Task;
    clientVersion: TaskInput;
    users: User[];
    onResolve: (resolvedTask: Partial<TaskInput>) => Promise<void>;
};

const ConflictResolver: React.FC<Props> = ({
    serverVersion,
    clientVersion,
    users,
    onResolve
}) => {
    const toTaskInput = (task: Task): TaskInput => ({
        _id: task._id,
        title: task.title,
        description: task.description,
        assignees: task.assignees.map((user) => user._id),
        assignedBy: task.assignedBy, // keep as User
        priority: task.priority,
        dueDate: task.dueDate,
        tags: task.tags,
        column: task.column,
        updatedAt: task.updatedAt
    });
    const [mergedTask, setMergedTask] = useState<TaskInput>(clientVersion);

    const handleChange = <K extends keyof TaskInput>(field: K, value: TaskInput[K]) => {
        setMergedTask((prev) => ({ ...prev, [field]: value }));
    };

    const getAssigneeDetails = (assigneeIds: string[], users: User[]) =>
        assigneeIds
            .map((id) => users.find((u) => u._id === id)) // find user by _id
            .filter(Boolean) as User[]; // remove nulls if id not found


    return (
        <div className="conflict-backdrop">
            <div className="conflict-modal">
                <h2 className="conflict-header">⚠️ Conflict Detected</h2>
                <p className="conflict-subtext">
                    This task has changes from two places. Choose a version or merge manually:
                </p>

                <div className="conflict-grid">
                    {/* Server Version */}
                    <div className="conflict-panel">
                        <h3 className="conflict-panel-title">🔒 Server Version</h3>
                        <div className="conflict-task-details">
                            <p><strong>Title:</strong> {serverVersion.title}</p>
                            <p><strong>Description:</strong> {serverVersion.description}</p>
                            <p><strong>Priority:</strong> {serverVersion.priority}</p>
                            <p><strong>Column:</strong> {serverVersion.column}</p>
                            <p><strong>Due Date:</strong> {serverVersion.dueDate ? new Date(serverVersion.dueDate).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Tags:</strong> {serverVersion.tags?.join(', ') || 'None'}</p>
                            <p><strong>Assigned By:</strong> {serverVersion.assignedBy?.username || 'Unknown'}</p>
                            <p><strong>Assignees:</strong> {serverVersion.assignees.map(p => p.username)?.join(', ') || 'None'}</p>
                        </div>
                        <button
                            className="conflict-btn"
                            onClick={() => onResolve(toTaskInput(serverVersion))}
                        >
                            Use Server Version
                        </button>
                    </div>

                    {/* Client Version */}
                    <div className="conflict-panel">
                        <h3 className="conflict-panel-title">💻 Client Version</h3>
                        <div className="conflict-task-details">
                            <p><strong>Title:</strong> {clientVersion.title}</p>
                            <p><strong>Description:</strong> {clientVersion.description}</p>
                            <p><strong>Priority:</strong> {clientVersion.priority}</p>
                            <p><strong>Column:</strong> {clientVersion.column}</p>
                            <p><strong>Due Date:</strong> {clientVersion.dueDate ? new Date(clientVersion.dueDate).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Tags:</strong> {clientVersion.tags?.join(', ') || 'None'}</p>
                            <p><strong>Assigned By:</strong> {clientVersion.assignedBy?.username || 'Unknown'}</p>
                            <p>
                                <strong>Assignees:</strong>{" "}
                                {getAssigneeDetails(clientVersion.assignees, users)
                                    .map((p) => p.username)
                                    .join(", ") || "None"}
                            </p>

                        </div>
                        <button
                            className="conflict-btn"
                            onClick={() => onResolve(clientVersion)}
                        >
                            Use Client Version
                        </button>
                    </div>

                    {/* Manual Merge */}
                    <div className="conflict-panel">
                        <h3 className="conflict-panel-title">🛠️ Merge Manually</h3>
                        <div className="conflict-task-details">
                            <div className="conflict-form-group">
                                <label>Title:</label>
                                <input
                                    type="text"
                                    value={mergedTask.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                />
                            </div>

                            <div className="conflict-form-group">
                                <label>Description:</label>
                                <textarea
                                    value={mergedTask.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                />
                            </div>

                            <div className="conflict-form-group">
                                <label>Priority:</label>
                                <select
                                    value={mergedTask.priority}
                                    onChange={(e) => handleChange('priority', e.target.value as TaskInput['priority'])}
                                >
                                    <option value="high">🔴 High</option>
                                    <option value="medium">🟠 Medium</option>
                                    <option value="low">🟢 Low</option>
                                </select>
                            </div>

                            <div className="conflict-form-group">
                                <label>Column:</label>
                                <select
                                    value={mergedTask.column}
                                    onChange={(e) => handleChange('column', e.target.value as TaskInput['column'])}
                                >
                                    <option value="todo">📋 To Do</option>
                                    <option value="inprogress">⏳ In Progress</option>
                                    <option value="done">✅ Done</option>
                                </select>
                            </div>

                            <div className="conflict-form-group">
                                <label>Due Date:</label>
                                <input
                                    type="date"
                                    value={mergedTask.dueDate?.slice(0, 10) || ''}
                                    onChange={(e) => handleChange('dueDate', e.target.value)}
                                />
                            </div>

                            <div className="conflict-form-group">
                                <label>Tags (comma-separated):</label>
                                <input
                                    type="text"
                                    value={mergedTask.tags.join(', ')}
                                    onChange={(e) =>
                                        handleChange(
                                            'tags',
                                            e.target.value.split(',').map((tag) => tag.trim())
                                        )
                                    }
                                />
                            </div>

                            <div className="conflict-form-group">
                                <label>Assigned By:</label>
                                <div>{mergedTask.assignedBy?.username || 'Unknown'}</div>
                            </div>

                            <div className="conflict-form-group">
                                <label>Assignees:</label>
                                <select
                                    multiple
                                    value={mergedTask.assignees}
                                    onChange={(e) =>
                                        handleChange(
                                            'assignees',
                                            Array.from(e.target.selectedOptions).map((option) => option.value)
                                        )
                                    }
                                >
                                    {users.map((user) => (
                                        <option key={user._id} value={user._id}>
                                            {user.username} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            className="conflict-btn-primary"
                            onClick={() => onResolve(mergedTask)}
                        >
                            ✅ Use Merged Version
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ConflictResolver;
