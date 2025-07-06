const Task = require("../models/task");
const user = require("../models/user");

exports.createTask = async (req, res) => {
  try {
    const { title, description, assignees, priority, dueDate, column, tags } =
      req.body;
    const exist = await Task.findOne({ title }).exec();
    if (["todo", "inprogress", "done"].includes(title) || exist) {
      return res
        .status(400)
        .json({ message: "Title is invalid or already exists" });
    }

    const task = new Task({
      title,
      description,
      assignees,
      priority,
      dueDate,
      column,
      tags,
    });
    const newTask = await task.save();
    res
      .status(201)
      .json({ data: newTask, message: "Task created successfully" });
  } catch (e) {
    res.status(500).json({
      message: e.message || "An error occurred while deleting the task",
    });
  }
};

exports.getUserTasks = async (req, res) => {
  try {
    const allTask = await Task.find({ assignees: req.user._id })
      .populate("assignees", "name email")
      .exec();
    if (!allTask || allTask.length === 0) {
      return res.status(404).json({ message: "No tasks found for this user" });
    }
    res
      .status(200)
      .json({ data: allTask, message: "Tasks retrieved successfully" });
  } catch (e) {
    res.status(500).json({
      message: e.message || "An error occurred while retrieving tasks",
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const deletedTask = await findByIdAndDelete(taskId);
    if (!deletedTask)
      return res.status(400).json({ message: "Task not found" });

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
    const { title, description, assignees, priority, dueDate, column, tags } =
      req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        assignees,
        priority,
        dueDate,
        column,
        tags,
      },
      { new: true }
    ).populate("assignees", "name email");

    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });

    res
      .status(200)
      .json({ data: updatedTask, message: "Task updated successfully" });
  } catch (e) {
    res.status(500).json({
      message: e.message || "An error occurred while updating the task",
    });
  }
};

exports.updateTaskColumn = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { column } = req.body;

    // Validate column
    if (!["todo", "inprogress", "done"].includes(column)) {
      return res.status(400).json({ message: "Invalid column value" });
    }

    // Find and update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { column },
      { new: true }
    ).populate("assignees", "name email");

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const allTasks = await Task.find().populate("assignees", "name email");

    const groupedColumns = {
      todo: allTasks.filter((task) => task.column === "todo"),
      inprogress: allTasks.filter((task) => task.column === "inprogress"),
      done: allTasks.filter((task) => task.column === "done"),
    };

    res.status(200).json({
      data: groupedColumns,
      message: "Task column updated successfully",
    });
  } catch (e) {
    console.error("Error in updateTaskColumn:", e);
    res.status(500).json({
      message: e.message || "An error occurred while updating the task column",
    });
  }
};
