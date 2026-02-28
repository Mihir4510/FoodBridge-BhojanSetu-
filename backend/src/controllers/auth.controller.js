
const usermodel = require("../models/user.model")
const jwt = require("jsonwebtoken")

//register controller
/*
--Post /api/auth/register
*/

async function userregistercontroller(req,res){

    const {email , name , password }=req.body;

const isexist= await usermodel.findOne({

    email: email
})

if(isexist){
    return res.status(422).json({
        message :"user already exist with the provide email",
        status:"failed"
    })
}

const user= await usermodel.create({
    email,password,name
})

const token= jwt.sign({userId :user._id},process.env.JWT_SECRET,{expiresIn:"3d"})

res.cookie("token")

res.status(201).json({
    user:{
        _id:user._id,
        email:user.email,
        name:user.name
    },
    token

})
}




//login contoller
/*
--POST /api/auth/login
*/
async function userlogincontroller(req ,res){
    const {email , password}=req.body

    const user = await usermodel.findOne({email}).select('+password')

    if(!user){
        return res.status(401).json({
            message:"Email or Password is INVALID"
        })
    }

        const isvalidpassword = await user.matchPassword(password)

        if(!isvalidpassword){
             return res.status(401).json({
            message:"Email or Password is INVALID"
        })

        }
        const token= jwt.sign({userId :user._id},process.env.JWT_SECRET,{expiresIn:"3d"})

            res.cookie("token")

     res.status(200).json({
         user:{
        _id:user._id,
        email:user.email,
        name:user.name,
        message:"Logged IN"
    },
    token

})
 }


module.exports={
    userregistercontroller,
    userlogincontroller
}