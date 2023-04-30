import { Router } from "express";
import authRoute from "./auth.route.js"


const router = Router()
// /auth/singup
router.use("/auth",authRoute)


export default router