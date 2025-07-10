const Task = require("../models/task");
const User = require("../models/user");
const Log = require("../models/logs");

// Utility: Add a log entry
async function addLog(userId, message) {
  try {
    await Log.create({
      user: userId,
      message,
    });
  } catch (err) {
    console.error("Failed to add log:", err.message);
  }
}

exports.createTask = async (req, res) => {
  try {
    let { title, description, assignees, priority, dueDate, column, tags } =
      req.body;

    const exist = await Task.findOne({ title }).exec();
    if (["todo", "inprogress", "done"].includes(title) || exist) {
      return res
        .status(400)
        .json({ message: "Title is invalid or already exists" });
    }

    if (!dueDate) {
      const now = new Date();
      now.setDate(now.getDate() + 2);
      dueDate = now;
    }

    const task = new Task({
      title,
      description,
      assignees,
      priority,
      dueDate,
      column,
      tags,
      assignedBy: req.user.userId,
    });

    const savedTask = await task.save();
    const newTask = await Task.populate(savedTask, [
      { path: "assignedBy", select: "username email" },
      { path: "assignees", select: "username email" },
    ]);

    await addLog(req.user.userId, `Created task "${title}"`);

    res
      .status(201)
      .json({ data: newTask, message: "Task created successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: e.message || "An error occurred while creating the task",
    });
  }
};

exports.getUserTasks = async (req, res) => {
  try {
    const allTasks = await Task.find({
      $or: [{ assignees: req.user.userId }, { assignedBy: req.user.userId }],
    })
      .populate("assignedBy", "username email")
      .populate("assignees", "username email")
      .exec();

    if (!allTasks || allTasks.length === 0) {
      return res.json({ message: "No tasks found for this user" });
    }

    await addLog(req.user.userId, "Fetched all tasks");

    res.status(200).json({
      data: allTasks,
      message: "Tasks retrieved successfully",
    });
  } catch (e) {
    res.status(500).json({
      message: e.message || "An error occurred while retrieving tasks",
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask)
      return res.status(400).json({ message: "Task not found" });

    await addLog(
      req.user.userId,
      `Deleted task "${deletedTask.title}" (ID: ${taskId})`
    );

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (e) {
    res.status(500).json({
      message: e.message || "An error occurred while deleting the task",
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    let { updatedAt, createdAt, ...updates } = req.body;

    const task = await Task.findById(taskId)
      .populate("assignedBy", "username email")
      .populate("assignees", "username email");

    if (!updates.dueDate) {
      const fallbackDueDate = new Date();
      fallbackDueDate.setDate(fallbackDueDate.getDate() + 2);
      updates.dueDate = fallbackDueDate;
    }

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (!updatedAt) {
      return res
        .status(400)
        .json({ message: "Missing updatedAt in request body" });
    }

    const dbTime = new Date(task.updatedAt).getTime();
    const clientTime = new Date(updatedAt).getTime();

    if (clientTime < dbTime) {
      return res.status(409).json({
        message: "Conflict detected",
        serverVersion: task,
        clientVersion: { updatedAt, ...updates },
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
      new: true,
      runValidators: true,
    })
      .populate("assignedBy", "username email")
      .populate("assignees", "username email");

    await addLog(req.user.userId, `Updated task "${task.title}"`);

    res
      .status(200)
      .json({ data: updatedTask, message: "Task updated successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: e.message || "An error occurred while updating the task",
    });
  }
};

exports.conflictResolution = async (req, res) => {
  try {
    const { taskId } = req.params;
    let { updatedAt, ...updates } = req.body;

    if (!updates.dueDate) {
      const fallbackDueDate = new Date();
      fallbackDueDate.setDate(fallbackDueDate.getDate() + 2);
      updates.dueDate = fallbackDueDate;
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
      new: true,
      runValidators: true,
    })
      .populate("assignedBy", "username email")
      .populate("assignees", "username email");

    if (!updatedTask)
      return res.status(400).json({ message: "Task not found" });

    await addLog(
      req.user.userId,
      `Resolved conflict for task "${updatedTask.title}"`
    );

    res
      .status(200)
      .json({ data: updatedTask, message: "Task conflict solved" });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: e.message || "An error occurred while solving conflict",
    });
  }
};

exports.updateTaskColumn = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { column } = req.body;

    if (!["todo", "inprogress", "done"].includes(column)) {
      return res.status(400).json({ message: "Invalid column value" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { column },
      { new: true, timestamps:false }
    ).populate("assignees", "username email");

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await addLog(
      req.user.userId,
      `Moved task "${updatedTask.title}" to column "${column}"`
    );

    res.status(200).json({
      data: updatedTask,
      message: "Task column updated successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: e.message || "An error occurred while updating the task column",
    });
  }
};

exports.smartAssign = async (req, res) => {
  try {
    const result = await Task.aggregate([
      { $unwind: "$assignees" },
      { $group: { _id: "$assignees", taskCount: { $sum: 1 } } },
      { $sort: { taskCount: 1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $replaceRoot: {
          newRoot: {
            _id: "$user._id",
            username: "$user.username",
            email: "$user.email",
          },
        },
      },
    ]);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No users assigned to any task." });
    }

    await addLog(req.user.userId, "Performed smart assign operation");

    res.status(200).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserLogs = async (req, res) => {
  try {
    const logs = await Log.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: "No logs found for user" });
    }

    res.status(200).json({ data: logs, message: "User logs retrieved" });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: e.message || "An error occurred while fetching logs",
    });
  }
};
