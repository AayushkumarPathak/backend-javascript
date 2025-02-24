import { Router } from "express";
import {logoutUser, registerUser,loginUser  } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJwt} from "../middlewares/auth.middleware.js";


const UserRouter = Router();

UserRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
);

UserRouter.route("/login").post(loginUser)

//secured routes
UserRouter.route("/logout").post(verifyJwt,logoutUser)


export default UserRouter;