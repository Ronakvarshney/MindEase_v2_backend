const mongoose = require('mongoose');
const config = require('../core/config');


const connectDB = async()=>{
   try{
    await mongoose.connect(config.dbUrl);
    console.log("Connected to MongoDB successfully");
   }
   catch(err){
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
   }
}

mongoose.connection.on('connected', ()=>{
    console.log("Mongoose connected to DB");
})

mongoose.connection.on('disconnected', ()=>{
    console.log("Mongoose disconnected from DB");
})

module.exports = connectDB ;