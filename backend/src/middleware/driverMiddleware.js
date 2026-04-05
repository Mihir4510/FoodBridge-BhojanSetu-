const jwt = require("jsonwebtoken");
const Driver = require("../models/driver.model.js");

const protectDriver = async (req, res, next) => {
  try {
    const token = req.cookies?.driverToken;

    if (!token) {
      return res.status(401).json({ message: "Not authorized. Please log in as a driver." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "driver") {
      return res.status(401).json({ message: "Invalid driver token." });
    }

    const driver = await Driver.findById(decoded.id);
    if (!driver) return res.status(401).json({ message: "Driver not found." });

    req.driver = driver;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = protectDriver;