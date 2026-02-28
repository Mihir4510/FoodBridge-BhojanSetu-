require ("dotenv").config()
const app = require("./src/app")
const connectdb = require("./src/config/db")

// function call
connectdb();

//server start
app.listen(3000,()=>{
    console.log (`Server Running on the  port number 3000`)
})