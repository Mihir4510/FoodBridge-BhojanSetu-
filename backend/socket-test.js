const io = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {

    console.log("Connected:", socket.id);

    const userId = "69a8f4cb3b145c2bbb3cfc26";

    socket.emit("join", userId);
    console.log(userId);
    

});

socket.on("newDonation", (data) => {
    console.log("📢 Notification:", data);
});