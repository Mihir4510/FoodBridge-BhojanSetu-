require ("dotenv").config()
const app = require("./src/app")
const connectdb = require("./src/config/db")


// function calling
connectdb()


app.listen(3000,()=>{
    console.log("Server running on the PORT 3000")
})