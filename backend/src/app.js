const cors = require("cors");
const express = require("express");
const cookieparser = require ("cookie-parser")
const globalErrorHandler = require("./middleware/error.middleware");


const authrouter=require("./routes/auth.routes")
const donationRouter = require("./routes/donation.routes");
const adminRoutes = require("./routes/admin.routes");



const app = express();

// Middleware
app.use(express.json());
app.use(cookieparser());


app.use(cors({
  origin: "http://localhost:5173", // frontend
  credentials: true                // allow cookies
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Routes
app.use("/api/auth", authrouter);

app.use("/api/donation", donationRouter);

app.use("/api/admin", adminRoutes);


//global errorhandler
app.use(globalErrorHandler);


module.exports=app


