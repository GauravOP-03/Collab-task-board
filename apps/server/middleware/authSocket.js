const jwt = require("jsonwebtoken");

function authSocket(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN);
    socket.user = user; // Attach user to socket for later use
    next();
  } catch (err) {
    return next(new Error("Authentication error: " + err.message));
  }
}

module.exports = authSocket;
