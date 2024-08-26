const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const ACTIONS = require("./Actions");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId]?.username,
        role: userSocketMap[socketId]?.role,
        muted: userSocketMap[socketId]?.muted || false,
      };
    }
  );
};

io.on("connection", (socket) => {
  socket.on(ACTIONS.JOIN, ({ roomId, username, role }) => {
    userSocketMap[socket.id] = { username, role, muted: false };
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });

    if (role === "teacher") {
      socket.on(ACTIONS.SEND_VIDEO_STREAM, (data) => {
        socket.in(roomId).emit(ACTIONS.RECEIVE_VIDEO_STREAM, data);
      });

      socket.on(ACTIONS.MUTE, () => {
        userSocketMap[socket.id].muted = true;
        socket.in(roomId).emit(ACTIONS.MUTE, { socketId: socket.id });
      });

      socket.on(ACTIONS.UNMUTE, () => {
        userSocketMap[socket.id].muted = false;
        socket.in(roomId).emit(ACTIONS.UNMUTE, { socketId: socket.id });
      });

      socket.on(ACTIONS.STOP_STREAM, () => {
        socket.in(roomId).emit(ACTIONS.STOP_STREAM);
      });
    }
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id]?.username,
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
