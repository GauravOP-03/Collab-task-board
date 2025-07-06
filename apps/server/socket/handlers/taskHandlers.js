function registerTaskHandlers(io, socket) {
  console.log("Registering task handlers for", socket.id);
  socket.on("task-created", (taskData) => {
    // console.log(taskData)
    socket.to(socket.boardId).emit("task-created", taskData);
  });
}

module.exports = registerTaskHandlers;
