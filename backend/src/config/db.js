const mongoose = require ("mongoose")


async function connectdb() 
{
    await mongoose.connect(process.env.MONGO_URI)
       .then(()=>{
           console.log("DataBase Connected(mongoose)")
       })
       .catch(err=>{
        console.log("Error connecting to DB")
        process.exit(1)
       })
    
}

module.exports = connectdb