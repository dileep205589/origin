
import express from "express";
import {
  forgotPasswordController,
  getUserProfileController,
  loginController,
  logoutController,
  passwordResetController,
  registerController,
  sendOtpEmailController,
  updateProfileController,
  updateProfilePicController,
  verifyOtpController,
} from "../controllers/userController.js";
import { isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";

import { rateLimit } from 'express-rate-limit'

/// RATE LIMITER 
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})

//router object
const router = express.Router();

//routes
// register
router.post("/register" , registerController);

//login
router.post("/login",  loginController);

//profile
router.get("/profile", isAuth, getUserProfileController);

//logout
router.get("/logout", isAuth, logoutController);

// uopdate profile
router.put("/profile-update", isAuth, updateProfileController);


// updte password

router.post("/forgot-password", forgotPasswordController);

router.post("/sendOtp",  sendOtpEmailController);

router.post("/verifyOtp",  verifyOtpController);


// update profile pic
router.put("/update-picture", isAuth, singleUpload, updateProfilePicController);

// FORGOT PASSWORD
router.post("/reset-password", passwordResetController);  

//export
export default router;
