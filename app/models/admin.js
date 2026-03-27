const { default: mongoose } = require("mongoose");


const AdminSchema = new mongoose.Schema({
    username : {
        type : String ,
        required : [true , "Username is required"] ,
        trim : true
    },
    email : {
        type : String ,
        required : [true , "Email is required"] ,
        unique : true ,
        trim : true
    } ,
    password : {
        type : String ,
        required : [true , "Password is required"] ,
        select : false
    } ,
    role : {
        type : String ,
        default : "admin"
    }
})

module.exports = mongoose.model("Admin" , AdminSchema) ;
