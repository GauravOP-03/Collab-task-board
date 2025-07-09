function registerTaskHandlers(io, socket) {
  // console.log("Registering task handlers for", socket.id);
  socket.on("task-created", (taskData) => {
    console.log("Task Created", taskData);
    console.log(socket.boardId);
    io.to(socket.boardId).emit("task-created", taskData);
  });

  socket.on("task-updated", (taskData) => {
    console.log(taskData);
    io.to(socket.boardId).emit("task-updated", taskData);
  });

  socket.on("task-deleted", (taskId) => {
    io.to(socket.boardId).emit("task-deleted", taskId);
  });

  socket.on("update-column", () => {
    console.log(socket.boardId);
    socket.to(socket.boardId).emit("update-column");
  });
}

module.exports = registerTaskHandlers;
