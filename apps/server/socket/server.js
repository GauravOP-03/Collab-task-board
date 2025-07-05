const authSocket = require("../middleware/authSocket");
// const registerTaskHandlers = require("./handlers/taskHandlers");
// const registerBoardHandlers = require("./handlers/boardHandlers");

function socketServer(io) {
  io.use(authSocket);

  io.on("connection", (socket) => {
    socket.join(socket.user.userId);
    console.log("New client connected", socket.id, socket.user.username);

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id, socket.user.username);
    });
  });
}

module.exports = socketServer;
