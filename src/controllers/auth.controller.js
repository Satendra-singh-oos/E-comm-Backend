import User from "../models/user.schema.js";

import asyncHandler from "../service/asyncHandler.js";
import CustomError from "../utils/CustomError.js";
import mailHelper from "../utils/mailHelper.js";

export const cookieOptions = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true
}

/******************************************************
 * @SIGNUP
 * @route http://localhost:5000/api/auth/signup
 * @description User signUp Controller for creating new user
 * @returns User Object
 ******************************************************/



//Signup a new User

export const signUp =asyncHandler( async(req,res)=>{
      //get data from user
      const {name, email, password } = req.body

      //validation
      if(!name || !email || !password){
        throw new CustomError("PLease add all fields", 400)
      }

      // adding this user to dataBase

      //But before adding we need to check if user already exists by running .findOne query

      const exisitingUser = await User.findOne({email});

      if(exisitingUser){
        throw new CustomError("User Already Exist",400)
      }

      //now after check we will store the user by making this .create query
      const user =await User.create({
        name,
        email,
        password
      })

     const token= user.getJWTtoken();

     //safety 
     user.password=undefined

     //store the user token in user cookie will be done with the help of cookie-parser
     res.cookie("token", token, cookieOptions)

      
     //send back response to user
     res.status(200).json({
        success:true,
        token,
        user
     })

});

//login user 

/******************************************************
 * @login
 * @route http://localhost:5000/api/auth/login
 * @description User login Controller for user to login  by checking the user email and passowrd from the database and also create a JWT token if the given credentials are valid.
 * @returns User Object with succes message 
 ******************************************************/

export const login = asyncHandler(async(req,res)=>{
        //get data from user
        const {email, password } = req.body
       //validating
        if(!email || !password){
            throw  new CustomError("Please fill all details",400)
        }

       //finding user in dataBase by making query
        const user = await User.findOne({email}).select("+password")
       
        if(!user){
            throw new CustomError("Email or Password wrong",400)
        }

       //comparing the normal text password with the hashed password which was hassed by using bcrypt
     const isPasswordMatched = await user.comparePassword(password);
     
     //if password matched then create token and save the token in cookies of the user with res
     if(isPasswordMatched){
        const token= user.getJWTtoken();
        user.password=undefined
        res.cookie("token",token,cookieOptions)

        return res.status(200).json({
            success:true,
            token,
            user
        })
     }

     throw new CustomError("Password is incorrect",400)
});


//signout

/******************************************************
 * @logout
 * @route http://localhost:5000/api/auth/logout
 * @description User logout Controller for user to logout and also clearing  the JWT token stored in a cookie
 * @returns JSON OBJECT 
 ******************************************************/

export const logout = asyncHandler(async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged Out'
    })
})



//getProfile 

export const getProfile = asyncHandler(async (req, res) => {
   //const user = req.user 
  const {user} = req

  if (!user) {
      throw new CustomError("User not found", 401)
  }

  res.status(200).json({
      success: true,
      user
  })
})


export const forgotPassword = asyncHandler(async (req, res) => {
 
    const {email}= req.body;

    const user =await User.findOne({email});

    if(!user){
        throw new CustomError("NO User Found ",404)
    }

    const resetToken =   user.generateForgotPassword();
    
    await user.save({validateBeforeSave:false})
    
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/password/reset/${resetToken}`

    const message = `Your password reset token is as follows \n\n ${resetUrl} \n\n if this was not requested by you, please ignore.`

    try {
        
        await mailHelper({
            email:user.email,
            subject:"Password Reset Mail",
            message,
        })
    } catch (error) {
        user.forgotPasswordExpiry =undefined
        user.forgotPasswordToken =undefined

        await user.save({validateBeforeSave:false})

        throw new CustomError(error.message|| "Email could not be sent",500)
    }
    
})


export const resetPassword = asyncHandler(async (req, res) => {
    
    const {token:resetToken }=req.params
    const {password, confirmPassword} = req.body
    
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: resetPasswordToken,
        forgotPasswordExpiry: { $gt : Date.now() }
    })

    if (!user) {
        throw new CustomError( "password reset token in invalid or expired", 400)
    }
 
    
    if (password !== confirmPassword) {
        throw new CustomError("password does not match", 400)
    }

    user.password = password;
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined
    
    await user.save()

    const token = user.getJWTtoken()
    res.cookie("token", token, cookieOptions)

    res.status(200).json({
        success: true,
        user,
    })

})