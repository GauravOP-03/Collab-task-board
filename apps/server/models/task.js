const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const task = new Schema(
  {
    title: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      unique: true,
    },
    dueDate: {
      type: Date,
    },
    assignees: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tags: {
      type: [String],
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    column: {
      type: String,
      enum: ["todo", "inprogress", "done"],
      default: "todo",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", task);
