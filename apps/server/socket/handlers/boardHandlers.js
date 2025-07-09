function registerBoardHandlers(io, socket) {
  // console.log("Registering board handlers for", socket.id);

  socket.on("joinBoard", (boardId) => {
    socket.boardId = boardId;
    socket.join(boardId);
    // console.log(`Socket ${socket.id} joined board ${boardId}`);

    // Notify client they successfully joined
    socket.emit("joinedBoard", boardId);
  });

  socket.on("leaveBoard", (boardId) => {
    console.log(`Socket ${socket.id} left board ${boardId}`);
    socket.leave(boardId);
  });
}

module.exports = registerBoardHandlers;
