let io;

function initSocket(server) {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // ✅ EXACT frontend URL
      credentials: true                // ✅ IMPORTANT
    }
  });

  io.on("connection", (socket) => {

    socket.on("joinRoom", (ngoId) => {
      socket.join(`ngo_${ngoId}`);
      console.log(`NGO ${ngoId} joined room`);
    });

    socket.on("joinDriverRoom", (driverId) => {
      socket.join(`driver_${driverId}`);
      console.log(`Driver ${driverId} joined room`);
    });

    socket.on("joinDonorRoom", (donorId) => {
      socket.join(`donor_${donorId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

module.exports = { initSocket, getIO };