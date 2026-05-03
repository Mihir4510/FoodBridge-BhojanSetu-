const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function protect(req, res, next) {
    try {
        let token;

        // ✅ 1. Check Authorization header FIRST (NEW way)
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // ✅ 2. Fallback to cookie (OLD way - for localhost)
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // ❌ No token
        if (!token) {
            return res.status(401).json({
                message: "Not authorized, no token provided"
            });
        }

        // ✅ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ⚠️ IMPORTANT: support both formats
        const userId = decoded.userId || decoded.id;

        const user = await User.findById(userId);

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