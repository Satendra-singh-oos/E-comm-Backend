import mongoose  from "mongoose";
import AuthRoles from "../utils/authRoles.js"
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken"
import config from "../config/index.js";
import crypto from "crypto"

const userSchema = new mongoose.Schema({
   
    name: {
        type:String,
        required:["true","Name is Required"],
        maxLength :[50,"Name Should Be Less Then 50 characters "]
    },

    email:{
        type:String,
        required:["true","Emaile is Required"],
    },

    password : {
        type:String,
        required:[true,"Password is Required"],
        minLength:[8,"Password must be atleast 8 chars"],
        select: false
    },

    role:{
        type:String,
        enum:Object.values(AuthRoles),
        default:AuthRoles.USER
    },

    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,

},{timestamps :true})


//Encrypt the password before saving: HOOKS


userSchema.pre("save", async function(next){
    if (!this.isModified("password")) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods = {

    //compare password

    comparePassword : async function(enteredPassword){
        return await bcrypt.compare(enteredPassword,this.password)
    },
    
    //Genrate JWT Token
    getJWTtoken: function(){
        JWT.sign({
            _id:this._id,
            role:this_role
        },config.JWT_SECRET,{
            expiresIn: config.JWT_EXPIRY
        })
    },

    //generate forgot password token
    generateForgotPassword : function(){
        const forgotToken = crypto.randomBytes(20).toString("hex")

         // just to encrypt the token generated by crypto
         this.forgotPasswordToken = crypto 
         .createHash("sha26")
         .update(forgotToken)
         .digest("hex") //this is updating the string in db

          //time for token to expire
        this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000

        return forgotToken //this is sending to to backend and we can pass it to front-end

    }

 
}

export default mongoose.model("User",userSchema);