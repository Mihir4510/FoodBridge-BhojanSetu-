const { body, validationResult } = require("express-validator");

// Common error handler for all validations
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
};

// Register Validation
const validateRegister = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("role")
        .optional()
        .isIn(["individual", "restaurant", "organization"])
        .withMessage("Invalid role type"),

    handleValidationErrors
];

// Login Validation
const validateLogin = [
    body("email")
        .isEmail()
        .withMessage("Valid email is required"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin
};