require("dotenv").config();

const app = require("./src/app");
const connectdb = require("./src/config/db");

const http = require("http");
const { initSocket } = require("./src/config/socket");

// connect database
connectdb();



const server = http.createServer(app);

// initialize socket
initSocket(server);


// start server
server.listen(3000, () => {
    console.log(`Server Running on port 3000`);
});

