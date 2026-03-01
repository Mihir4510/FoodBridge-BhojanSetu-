const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function protect(req, res, next) {
    try {
        let token;

        // Check cookie first
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                message: "Not authorized, no token provided"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user (exclude password)
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Not authorized, invalid token"
        });
    }
}

module.exports = protect;