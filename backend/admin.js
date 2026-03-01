require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/user.model");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("MongoDB Connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "mihirparmar766@gmail.com"
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    // Create admin (password will be hashed by pre-save middleware)
    const admin = await User.create({
      name: "Admin",
      email: "mihirparmar766@gmail.com",
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
      isApproved: true
    });

    console.log("Admin created successfully");
    console.log("Email:", admin.email);
    console.log("Password:", admin.password);

    process.exit();

  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();