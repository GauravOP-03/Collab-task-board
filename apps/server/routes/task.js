const express = require("express");
const {
  createTask,
  getUserTasks,
  deleteTask,
  updateTask,
  updateTaskColumn,
  smartAssign,
  conflictResolution,
  getUserLogs,
} = require("../controller/taskController");
const { verifyToken } = require("../middleware/verify");
const router = express.Router();

router.get("/", verifyToken, getUserTasks);
router.post("/", verifyToken, createTask);
router.delete("/:taskId", verifyToken, deleteTask);
router.put("/:taskId", verifyToken, updateTask);
router.patch("/:taskId/column", verifyToken, updateTaskColumn);
router.get("/smartAssign", verifyToken, smartAssign);
router.put("/conflict/:taskId/", verifyToken, conflictResolution);
router.get("/logs", verifyToken, getUserLogs);

module.exports = router;
