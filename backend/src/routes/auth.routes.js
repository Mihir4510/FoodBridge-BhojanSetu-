const express = require ("express")
// controller import
const authcontroller = require("../controllers/auth.controller"); 

//middleware import
const { validateRegister, validateLogin } = require("../middleware/validation.middleware");

const  router =express.Router()

// POST /api/auth/register
router.post("/register",validateRegister,authcontroller.userregistercontroller)

//POST /api/auth/login
router.post("/login",validateLogin ,authcontroller.userlogincontroller)




//POST /api/auth/logoout
router.post("/logout",authcontroller.logoutController)

module.exports=router


