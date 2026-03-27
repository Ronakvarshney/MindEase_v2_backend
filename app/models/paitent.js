const mongoose = require('mongoose');
    const bcrypt = require('bcryptjs') ;



const paitentSchema = new mongoose.Schema({
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
    emailVerified : {
        type : Boolean ,
        default : false
    } ,
    emailverificationToken : {
        type : String 
    },
    emailVerificationTokenExpiry : {
        type : Date 
    },
    resetPasswordToken : {
        type : String 
    },
    resetPasswordTokenExpiry : {
        type : Date 
    },
    role : {
        type : String ,
        default : "paitent"
    },
    mental_health_report : {
        risk_level : {
            type : String
        },
        summary : {
            type : String 
        },
        health_score : {
            type : String 
        }
    },
    
    bookings : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Booking"
    }]



} , { timestamps : true }) ;    


paitentSchema.pre('save' , async function() {
    if (!this.isModified('password')) {
        return ;
    }
    const salt = await bcrypt.genSalt(10) ;
    this.password = await bcrypt.hash(this.password , salt) ;
}) ;

paitentSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword , this.password) ;
} ;

module.exports = mongoose.model("Paitent" , paitentSchema) ;