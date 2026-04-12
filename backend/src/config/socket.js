let io;

function initSocket(server) {
    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.on("connection", (socket) => {
  // Existing: NGO joins their room
  socket.on("joinRoom", (ngoId) => {
    socket.join(`ngo_${ngoId}`);
    console.log(`NGO ${ngoId} joined room`);
  });
 
  // NEW: Driver joins their own room
  socket.on("joinDriverRoom", (driverId) => {
    socket.join(`driver_${driverId}`);
    console.log(`Driver ${driverId} joined room`);
  });
 
  // Existing: Donor joins their room (for accept notifications)
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