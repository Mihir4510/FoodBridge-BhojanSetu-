const cors = require("cors");
const express = require("express");
const cookieparser = require ("cookie-parser")
const globalErrorHandler = require("./middleware/error.middleware");


const authrouter=require("./routes/auth.routes")
const donationRouter = require("./routes/donation.routes");
const adminRoutes = require("./routes/admin.routes");
const driverRoutes = require("./routes/driver.routes");
const driverAppRoutes = require("./routes/driverApplicationRoutes.js");



const app = express();
const isProd = process.env.NODE_ENV === "production";

// Middleware
app.use(express.json());
app.use(cookieparser());


app.use(cors({
  origin: isProd
    ? process.env.CLIENT_URL
    : "http://localhost:5173",
  credentials: true,
}));


// Routes
app.use("/api/auth", authrouter);

app.use("/api/donation", donationRouter);

app.use("/api/admin", adminRoutes);

app.use("/api/driver", driverRoutes);

app.use("/api/driver-apply", driverAppRoutes);


//global errorhandler
app.use(globalErrorHandler);


module.exports=app


