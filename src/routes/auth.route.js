import { Router } from "express";
import{forgotPassword, getProfile,login, logout, resetPassword, signUp, } from "../controllers/auth.controller.js"
import {isLoggedIn} from "../middlewares/auth.middleware.js"


const router =Router()

router.post("/signup",signUp)
router.post("/login",login)
router.get("/logut",logout)


router.post("/password/forgot/", forgotPassword)
router.post("/password/reset/:token", resetPassword)

//authorize(AuthRole.USER)
router.get("/getProfile", isLoggedIn,getProfile)

export default router;