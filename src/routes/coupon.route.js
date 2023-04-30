import { Router } from "express";
import {getAllCoupons, createCoupon ,updateCoupon,deleteCoupon} from "../controllers/coupon.controller.js"

import {isLoggedIn,authorize} from "../middlewares/auth.middleware.js"

import AuthRoles from "../utils/authRoles.js"

const router = Router()

router.post("/createCoupon",isLoggedIn,authorize(AuthRoles.ADMIN),createCoupon)

router.delete("/deleteCoupon/:id",isLoggedIn,authorize(AuthRoles.ADMIN ,AuthRoles.MODERATOR),deleteCoupon)

router.put("/updateCoupon/:id",isLoggedIn,authorize(AuthRoles.ADMIN ,AuthRoles.MODERATOR),updateCoupon)

router.get("/getAllCoupons",isLoggedIn,authorize(AuthRoles.ADMIN , AuthRoles.MODERATOR ), getAllCoupons)

export default router