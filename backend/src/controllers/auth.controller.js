const usermodel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");

//register controller
/*
--Post /api/auth/register
*/
async function userregistercontroller(req, res) {
  try {
    const { email, name, password, role, location } = req.body;

    if (role === "admin") {
      return res.status(403).json({
        message: "You cannot register as admin",
      });
    }

    // ✅ Check location (MANDATORY)
    if (
      !location ||
      !location.coordinates ||
      location.coordinates.length !== 2 ||
      location.coordinates[0] == null ||
      location.coordinates[1] == null
    ) {
      return res.status(400).json({
        message: "Location is required. Please allow location access.",
      });
    }

    const isexist = await usermodel.findOne({ email });

    if (isexist) {
      return res.status(422).json({
        message: "User already exists with this email",
      });
    }

    // ✅ Create user with correct location
    const user = await usermodel.create({
      name,
      email,
      password,
      role,
      location: {
        type: "Point",
        coordinates: location.coordinates, // ✅ FIXED
      },
    });

    await sendEmail({
      to: user.email,
      subject: "Welcome to BhojanSetu!",
      text: `Hello ${user.name}, welcome!`,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "lax",
    //   path: "/",
    // });
const isProd = process.env.NODE_ENV === "production";

console.log("ENV:", process.env.NODE_ENV);

res.cookie("token", token, {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
});
    res.status(201).json({
      user,
      token,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
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
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: false,
//   sameSite: "lax",
 
// });
const isProd = process.env.NODE_ENV === "production";

res.cookie("token", token, {
  httpOnly: true,
  secure: isProd,                      // ✅ true in production
  sameSite: isProd ? "none" : "lax",   // ✅ correct behavior
  path: "/",
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


// /me api
const getMe = async (req, res) => {
  try {
    // req.user is already attached by protect middleware
    const user = req.user;
 
    res.status(200).json({
      user: {
        id:             user._id,
        name:           user.name,
        email:          user.email,
        role:           user.role,
        location:       user.location,
        restaurantName: user.restaurantName || null,
        phone:          user.phone          || null,
        isApproved:     user.isApproved     || false,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
//logout contoller
/*
--POST /api/auth/logout
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



module.exports = {
 
  userregistercontroller,
  userlogincontroller,
  logoutController,
  getMe
};
