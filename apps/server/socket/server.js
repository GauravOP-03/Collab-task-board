const authSocket = require("../middleware/authSocket");
const registerTaskHandlers = require("./handlers/taskHandlers");
const registerBoardHandlers = require("./handlers/boardHandlers");

function socketServer(io) {
  io.use(authSocket);

  io.on("connection", (socket) => {
    socket.join(socket.user.userId);
    console.log("New client connected", socket.id, socket.user.username);

    socket.on("joinBoard", (boardId) => {
      socket.boardId = boardId;
      socket.join(boardId);
      console.log(`Socket ${socket.id} joined board ${boardId}`);

      // Notify client they successfully joined
      socket.emit("joinedBoard", boardId);
    });

    socket.on("leaveBoard", (boardId) => {
      console.log(`Socket ${socket.id} left board ${boardId}`);
      socket.leave(boardId);
    });

    registerBoardHandlers(io, socket);
    registerTaskHandlers(io, socket);
    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id, socket.user.username);
    });
  });
}

module.exports = socketServer;
