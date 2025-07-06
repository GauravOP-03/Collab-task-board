const express = require("express");
const {
  createTask,
  getUserTasks,
  deleteTask,
  updateTask,
  updateTaskColumn,
} = require("../controller/taskController");
const { verifyToken } = require("../middleware/verify");
const router = express.Router();

router.get("/", verifyToken, getUserTasks);
router.post("/", verifyToken, createTask);
router.delete("/:taskId", verifyToken, deleteTask);
router.patch("/:taskId", verifyToken, updateTask);
router.patch("/:taskId/column", verifyToken, updateTaskColumn);

module.exports = router;
