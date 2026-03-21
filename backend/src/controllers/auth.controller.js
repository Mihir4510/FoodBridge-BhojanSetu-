const usermodel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const generateOTP = require("../utils/otp");

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
  // const userData = {
  //   email,
  //   name,
  //   password,
  //   location: {
  //       type: "Point",
  //       coordinates: [longitude, latitude]
  //   }
  // };
  const userData = {
  name: req.body.name,
  email: req.body.email,
  password: req.body.password,
  role: req.body.role,
};

if (
  req.body.location &&
  req.body.location.coordinates &&
  req.body.location.coordinates[0] !== null &&
  req.body.location.coordinates[1] !== null
) {
  userData.location = {
    type: "Point",
    coordinates: req.body.location.coordinates,
  };
}



  // Only add role if it is valid and not empty
  if (role && role.trim() !== "") {
    userData.role = role;
  }
  // ✅ Generate OTP
const otp = generateOTP();

// ✅ Store OTP in userData
userData.otp = otp;
userData.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
userData.isVerified = false;

  // Create user
  const user = await usermodel.create(userData);

  // ---- SEND EMAIL WITH OTP ----
await sendEmail({
  to: user.email,
  subject: "Welcome to BhojanSetu!",
  
  text: `Hello ${user.name},

Thank you for registering on BhojanSetu.

Your OTP is ${otp}. It will expire in 5 minutes.`,

  html: `
    <h2>Hello ${user.name},</h2>
    <p>Thank you for registering on <strong>BhojanSetu</strong>.</p>
    <p>Your OTP is: <b>${otp}</b></p>
    <p>Valid for 5 minutes</p>
  `
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
 console.log(req.body)

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
  // verify otp

if (!user.isVerified) {
  return res.status(403).json({
    message: "Please verify OTP first",
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

//logout contoller
/*
--POST /api/auth/login
*/
const logoutController = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true, // JS cannot access cookie
      secure:false,
      sameSite: "strict", // prevent CSRF
      expires: new Date(0), // expire immediately
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during logout",
    });
  }
};
// VERIFY OTP CONTROLLER
async function verifyOtpController(req, res) {
  const { email, otp } = req.body;

  const user = await usermodel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  

  // OTP match check
  if (user.otp != otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // Expiry check
  if (user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  // Success
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  res.status(200).json({
    message: "OTP verified successfully",
  });
}



module.exports = {
  
  userregistercontroller,
  userlogincontroller,
  logoutController,
  verifyOtpController 
};
