require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const socketServer = require("./socket/server");

const corsOrigin = [
  process.env.FRONTEND_URL1,
  process.env.FRONTEND_URL2,
  "http://localhost:5173",
];

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  },
});

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}

main()
  .then((e) => {
    console.log("Database Connected");
  })
  .catch((er) => {
    console.log(er);
  });

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", require("./routes/auth"));
app.use("/api/users", require("./routes/user"));
app.use("/api/tasks", require("./routes/task"));

socketServer(io);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server running on port 3000");
});
