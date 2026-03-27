import { decodeToken } from "../core/security/jwt";


export const protect = (req , res , next)=>{
    try{
     const token = req.cookies.token ;
        if(!token){
            return res.status(401).json({
                success : false ,
                message : "Unauthorized access - No token provided"
            })
        }

        const decoded = decodeToken(token);
        if(!decoded){
            return res.status(401).json({
                success : false ,
                message : "Unauthorized access - Invalid token"
            })
        }

        req.user  = {
            userId : decoded.userId ,
            role : decoded.role ,
            email : decoded.email
        }
        next() ;


    }
    catch(err){
        console.error("Error in auth middleware:", err);
        res.status(500).json({
            success : false ,
            message : "Server error in auth middleware"
        })
    }
}