// require ("dotenv").config()
// const app = require("./src/app")
// const connectdb = require("./src/config/db")
// import authRoutes from "./routes/auth.routes.js";

// // function calling
// connectdb()


// app.listen(3000,()=>{
//     console.log("Server running on the PORT 3000")
// })



// import express from "express";


// import cors from "cors";
// import authRoutes from "./routes/authRoutes.js";

// const app = express();

// app.use(express.json());
// app.use(cors());

// app.use("/api/auth", authRoutes);

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./src/routes/auth.routes");
const donationRoutes = require("./src/routes/donation.routes");
const requestRoutes = require("./src/routes/request.routes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);

// Home Route (test)
app.get("/", (req, res) => {
  res.send("BhojanSetu API Running 🚀");
});

// MongoDB Connection + Server Start
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(" Server running on port 3000");
    });
  })
  .catch((err) => {
    console.log(" Database connection failed:", err.message);
  });