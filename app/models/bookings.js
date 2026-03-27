const { default: mongoose } = require("mongoose");


const BookingSchema = new mongoose.Schema({
    paitent : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Paitent",
        reqiured : true 
    },

    therapist : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Therapist",
        required : true 
    },

    cause : {
        type : String ,
        required : [true , "Cause of booking is required"] ,
        maxlength : [500 , "Cause cannot exceed 500 characters"] ,
        trim : true
    },
    contact : {
        type : String ,
        required : [true , "Contact information is required"] ,
        trim : true 
    },

    meetingMode : {
        type : String ,
        enum : ["online" , "offline"] ,
        required : [true , "Meeting mode is required"],
        default : "online"
    },
    scheduledAt : {
        type : Date ,
        required : [true , "Scheduled date and time is required"] ,
    },
    status : {
        type : String ,
        enum : ["pending" , "confirmed" , "cancelled"] ,
        default : "pending"
    }



} , { timestamps : true }) ;

module.exports = mongoose.model("Booking" , BookingSchema) ;