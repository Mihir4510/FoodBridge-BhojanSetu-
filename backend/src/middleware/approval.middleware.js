function checkApproval(req, res, next) {
    if (!req.user.isApproved) {
        return res.status(403).json({
            message: "Your account is pending admin approval"
        });
    }

    next();
}

module.exports = checkApproval;