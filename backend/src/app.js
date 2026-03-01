const express = require("express");
const mongoose = require("mongoose");
const cookieparser = require ("cookie-parser")
const authrouter=require("./routes/auth.routes")
require("dotenv").config();


const app = express();

// Middleware
app.use(express.json());
app.use(cookieparser())

// Routes
app.use("/api/auth", authrouter);


module.exports=app


