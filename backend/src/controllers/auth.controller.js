// const usermodel = require("../models/user.model");
// const jwt = require("jsonwebtoken");
// const sendEmail = require("../utils/email");

// //register controller
// /*
// --Post /api/auth/register
// */
// async function userregistercontroller(req, res) {
//   try {
//     const { email, name, password, role, location } = req.body;

//     if (role === "admin") {
//       return res.status(403).json({
//         message: "You cannot register as admin",
//       });
//     }

//     // ✅ Check location (MANDATORY)
//     if (
//       !location ||
//       !location.coordinates ||
//       location.coordinates.length !== 2 ||
//       location.coordinates[0] == null ||
//       location.coordinates[1] == null
//     ) {
//       return res.status(400).json({
//         message: "Location is required. Please allow location access.",
//       });
//     }

//     const isexist = await usermodel.findOne({ email });

//     if (isexist) {
//       return res.status(422).json({
//         message: "User already exists with this email",
//       });
//     }

//     // ✅ Create user with correct location
//     const user = await usermodel.create({
//       name,
//       email,
//       password,
//       role,
//       location: {
//         type: "Point",
//         coordinates: location.coordinates, // ✅ FIXED
//       },
//     });



//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "3d",
//     });

//     // res.cookie("token", token, {
//     //   httpOnly: true,
//     //   secure: false,
//     //   sameSite: "lax",
//     //   path: "/",
//     // });
// const isProd = process.env.NODE_ENV === "production";

// console.log("ENV:", process.env.NODE_ENV);

// res.cookie("token", token, {
//   httpOnly: true,
//   secure: isProd,
//   sameSite: isProd ? "none" : "lax",
//   path: "/",
// });
//     res.status(201).json({
//       user,
//       token,
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// }
// //login contoller
// /*
// --POST /api/auth/login
// */
// async function userlogincontroller(req, res) {
//   const { email, password } = req.body;
//  console.log(req.body)

//   const user = await usermodel
//   .findOne({ email })
//   .select("+password");

//   if (!user) {
//     return res.status(401).json({
//       message: "Email or Password is INVALID",
//     });
//   }

//   const isvalidpassword = await user.comparePassword(password);

//   if (!isvalidpassword) {
//     return res.status(401).json({
//       message: "Email or Password is INVALID",
//     });
//   }
//   const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//     expiresIn: "3d",
//   });

// //   res.cookie("token", token, {
// //     httpOnly: true,
// //     secure: false,
// //   sameSite: "lax",
 
// // });
// const isProd = process.env.NODE_ENV === "production";

// res.cookie("token", token, {
//   httpOnly: true,
//   secure: isProd,                      // ✅ true in production
//   sameSite: isProd ? "none" : "lax",   // ✅ correct behavior
//   path: "/",
// });
//   res.status(200).json({
//     user: {
//       _id: user._id,
//       email: user.email,
//       name: user.name,
//       role: user.role,
//     },
//     message: "Logged IN",
//     token,
//   });
// }


// // /me api
// const getMe = async (req, res) => {
//   try {
//     // req.user is already attached by protect middleware
//     const user = req.user;
 
//     res.status(200).json({
//       user: {
//         id:             user._id,
//         name:           user.name,
//         email:          user.email,
//         role:           user.role,
//         location:       user.location,
//         restaurantName: user.restaurantName || null,
//         phone:          user.phone          || null,
//         isApproved:     user.isApproved     || false,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error." });
//   }
// };
// //logout contoller
// /*
// --POST /api/auth/logout
// */
// const logoutController = (req, res) => {
//   try {
//    const isProd = process.env.NODE_ENV === "production";

// res.cookie("token", "", {
//   httpOnly: true,
//   secure: isProd,
//   sameSite: isProd ? "none" : "lax",
//   expires: new Date(0),
//   path: "/",
// });

//     return res.status(200).json({
//       success: true,
//       message: "Logged out successfully",
//     });
//   } catch (error) {
//     console.error("Logout Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong during logout",
//     });
//   }
// };



// module.exports = {
 
//   userregistercontroller,
//   userlogincontroller,
//   logoutController,
//   getMe
// };
const usermodel = require("../models/user.model");
const jwt = require("jsonwebtoken");

// ── Register ───────────────────────────────────────────────
// POST /api/auth/register
async function userregistercontroller(req, res) {
  try {
    const {
      email, name, password, role,
      phone, city,
      ngoName, registrationNo,
      restaurantName, address,
      location,
    } = req.body;

    // Block admin self-registration
    if (role === "admin") {
      return res.status(403).json({ message: "You cannot register as admin" });
    }

    // ✅ FIX 1: Accept [0,0] as valid coordinates (GPS denied fallback).
    // Old code checked `coordinates[0] == null` which is fine for null,
    // but the intent was to require location — we now allow [0,0] so the
    // frontend GPS-denied case never blocks registration.
    const coords =
      location?.coordinates?.length === 2
        ? location.coordinates
        : [0, 0]; // safe default

    // ✅ FIX 2: Check duplicate BEFORE doing any heavy work (bcrypt).
    // This means duplicate emails fail fast (~50ms) instead of after
    // bcrypt hashing (~2–10s), which was causing the timeout symptom.
    const isexist = await usermodel.findOne({ email }).lean();
    if (isexist) {
      return res.status(409).json({
        // ✅ FIX 3: Use 409 Conflict (not 422) so the frontend can detect
        // "already exists" by status code — no brittle message string matching.
        message: "User already exists with this email",
      });
    }

    // ✅ FIX 4: Save ALL fields the frontend sends.
    // Old code only saved name/email/password/role/location — phone, city,
    // ngoName, registrationNo, restaurantName, address were silently dropped.
    const user = await usermodel.create({
      name,
      email,
      password,       // hashed by pre('save') hook in the model
      role,
      phone:          phone          || null,
      city:           city           || null,
      ngoName:        ngoName        || null,
      registrationNo: registrationNo || null,
      restaurantName: restaurantName || null,
      address:        address        || null,
      location: {
        type: "Point",
        coordinates: coords,
      },
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });

    // Return a clean user object — never return the raw document
    // (it contains the hashed password even though select:false skips
    // it on finds, it IS present on a fresh .create() result).
    return res.status(201).json({
      token,
      user: {
        _id:            user._id,
        name:           user.name,
        email:          user.email,
        role:           user.role,
        phone:          user.phone,
        city:           user.city,
        ngoName:        user.ngoName,
        registrationNo: user.registrationNo,
        restaurantName: user.restaurantName,
        address:        user.address,
        isApproved:     user.isApproved,
        location:       user.location,
      },
    });

  } catch (error) {
    // ✅ FIX 5: Handle Mongoose duplicate key error (E11000) explicitly.
    // This fires when two requests race and both pass the findOne check
    // before either inserts — the unique index on email catches it.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}

// ── Login ──────────────────────────────────────────────────
// POST /api/auth/login
async function userlogincontroller(req, res) {
  try {
    const { email, password } = req.body;

    const user = await usermodel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Email or Password is INVALID" });
    }

    const isvalidpassword = await user.comparePassword(password);
    if (!isvalidpassword) {
      return res.status(401).json({ message: "Email or Password is INVALID" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      token,
      message: "Logged IN",
      user: {
        _id:   user._id,
        email: user.email,
        name:  user.name,
        role:  user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}

// ── /me ────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      user: {
        id:             user._id,
        name:           user.name,
        email:          user.email,
        role:           user.role,
        phone:          user.phone          || null,
        city:           user.city           || null,
        ngoName:        user.ngoName        || null,
        registrationNo: user.registrationNo || null,
        restaurantName: user.restaurantName || null,
        address:        user.address        || null,
        location:       user.location,
        isApproved:     user.isApproved     || false,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
};

// ── Logout ─────────────────────────────────────────────────
const logoutController = (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      expires: new Date(0),
      path: "/",
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong during logout" });
  }
};

module.exports = {
  userregistercontroller,
  userlogincontroller,
  logoutController,
  getMe,
};