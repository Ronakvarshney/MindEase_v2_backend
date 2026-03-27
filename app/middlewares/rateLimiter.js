const rateLimit = require('express-rate-limit') ;


const generalLimiter = rateLimit({
    windowMs : 15 * 60 * 1000 , // 15 minutes
    max : 100 , // limit each IP to 100 requests per windowMs
    message : {
        success : false ,
        message : "Too many requests from this IP, please try again after 15 minutes"
    },
    standardHeaders : true , // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders : false , // Disable the `X-RateLimit-*` headers
})

const authLimiter = rateLimit({
    windowMs : 15 * 60 * 1000 , // 15 minutes
    max : 5 , // limit each IP to 5 requests per windowMs
    message : {
        success : false ,
        message : "Too many login attempts from this IP, please try again after 15 minutes"
    },  
    legacyHeaders : false , // Disable the `X-RateLimit-*` headers
    standardHeaders : true , // Return rate limit info in the `RateLimit-*` headers
})

module.exports = {
    authLimiter ,
    generalLimiter
}