
import config from "../config/index.js";
import User from "../models/user.schema.js"
import asyncHandler from "../service/asyncHandler.js";
import CustomError from "../utils/CustomError.js"


export const isLoggedIn = asyncHandler(async(req,res,next)=>{
    let token;
    
    if (req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) ) {
        token = req.cookies.token || req.headers.authorization.split(" ")[1]
    
    }

    if(!token){
        throw new CustomError("Not Authorize to access",401)
    }

    try {
      const decodeJwtPayload = JWT.verify(token,config.JWT_SECRET);

      req.user = await User.findById(decodeJwtPayload._id,"name email role")
      next()

    } catch (error) {
        throw new CustomError("NOt Authorize to access the resource",401)
    }

})


//HIHGER ORDER FUNCTION 
//This authorize middleware only can run after the isLoggedIn middleware

export const authorize = (...requiredRoles) => asyncHandler( async (req, res, next) => {
    if (!requiredRoles.includes(req.user.role)) {
        throw new CustomError("You are not authorized to access this resource")
    }
    next()
})


