import { Router } from "express";
import {createCollection,getAllCollection,updateCollection,deleteCollection} from "../controllers/collection.controller.js"
import {isLoggedIn ,authorize} from "../middlewares/auth.middleware.js"

import AuthRole from "../utils/authRoles.js"


const router = Router()


router.post("/createCollection",isLoggedIn,authorize(AuthRole.ADMIN ,AuthRole.MODERATOR), createCollection)

router.delete("/deleteCollection/:id",isLoggedIn,authorize(AuthRole.ADMIN , AuthRole.MODERATOR),deleteCollection)


router.put("/updateCollection/:id",isLoggedIn,authorize(AuthRole.ADMIN ,AuthRole.MODERATOR),updateCollection)

router.get("/getAllCollection",isLoggedIn,authorize(AuthRole.ADMIN ,AuthRole.MODERATOR),getAllCollection)

export default router