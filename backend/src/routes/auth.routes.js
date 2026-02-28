const express = require ("express")
const authcontroller= require("../controllers/auth.controller")

const  router =express.Router()

// POST /api/auth/register
router.post("/register",authcontroller.userregistercontroller)

//POST /api/auth/login
router.post("/login",authcontroller.userlogincontroller)




module.exports=router


