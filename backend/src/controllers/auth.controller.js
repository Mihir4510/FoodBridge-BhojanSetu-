const usermodel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");

//register controller
/*
--Post /api/auth/register
*/

async function userregistercontroller(req, res) {
  const { email, name, password, role , latitude, longitude } = req.body;

  // for admin only
  if (role === "admin") {
    return res.status(403).json({
      message: "You cannot register as admin",
    });
  }

  // Check if user already exists
  const isexist = await usermodel.findOne({ email });

  if (isexist) {
    return res.status(422).json({
      message: "User already exists with this email",
      status: "failed",
    });
  }

  // user data
  const userData = {
    email,
    name,
    password,
    location: {
        type: "Point",
        coordinates: [longitude, latitude]
    }
  };

  // Only add role if it is valid and not empty
  if (role && role.trim() !== "") {
    userData.role = role;
  }

  // Create user
  const user = await usermodel.create(userData);

  // ---- SEND WELCOME EMAIL ----
  await sendEmail({
    to: user.email,
    subject: "Welcome to BhojanSetu!",
    text: `Hello ${user.name},\n\nThank you for registering on BhojanSetu. We’re excited to have you on board!`,
    html: `<h2>Hello ${user.name},</h2><p>Thank you for registering on <strong>BhojanSetu</strong>. We’re excited to have you on board!</p>`
  });

  // Generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token, {
    httpOnly: true,
  });

  res.status(201).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  });
}

//login contoller
/*
--POST /api/auth/login
*/
async function userlogincontroller(req, res) {
  const { email, password } = req.body;

  const user = await usermodel
  .findOne({ email })
  .select("+password");

  if (!user) {
    return res.status(401).json({
      message: "Email or Password is INVALID",
    });
  }

  const isvalidpassword = await user.comparePassword(password);

  if (!isvalidpassword) {
    return res.status(401).json({
      message: "Email or Password is INVALID",
    });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict"
});
  res.status(200).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    message: "Logged IN",
    token,
  });
}

module.exports = {
  userregistercontroller,
  userlogincontroller,
};
