
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";
import userModel from "../models/userModel.js";
import JWT from 'jsonwebtoken';
import bcrypt from "bcrypt";
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { comparePassword } from "../middlewares/Authhelper.js";
import otpModel from "../models/otpModel.js";



const JWT_SECRET_KEY = "ecom"

const EMAIL_USER = process.env.EMAIL_USER; 
const EMAIL_PASS = process.env.EMAIL_PASS;



export const registerController = async (req, res) => {
  try {
    const { name, email, password, address, city, country, phone } = req.body;

    // Validation
    if (!name || !email || !password || !city || !address || !country || !phone  ) {
      return res.status(400).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    // Check existing user
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "Email already taken",
      });
    }

    // Hash password before creating user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      address,
      city,
      country,
      phone,
    });

    res.status(201).send({
      success: true,
      message: "Registration successful, please login",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in Register API",
      error: error.message,
    });
  }
};

//LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }

    // Compare password using bcrypt

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "Invalid password.",
      });
    }


    // Generate token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // Success response
    res.status(200).send({
      success: true,
      message: "Login successful.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message || error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error: error.message,
    });
  }
};



// GET USER PROFILE
export const getUserProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.password = undefined;

    res.status(200).send({
      success: true,
      message: "User Profile Fetched Successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in Profile API",
      error: error.message, // send just the message
    });
  }
};

////  LOGOUT

export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Logout SUccessfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Logout API",
      error,
    });
  }
};

// UPDATE USER PROFILE

export const updateProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    // validation
    if (!user) {
      res.status(404).send({
        success: false,
        message: "User Not Found",
      });
    }

    const { name, email, address, city, country, phone } = req.body;
    // validation + Update
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (city) user.city = city;
    if (country) user.country = country;
    if (phone) user.phone = phone;
    //save user
    await user.save();
    res.status(200).send({
      success: true,
      message: "User Profile Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In update profile API",
      error,
    });
  }
};

//update user passsword

export const forgotPasswordController  = async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const otp = crypto.randomBytes(3).toString("hex"); 
  const expiration = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

  const otpEntry = new otpModel({ userId: user._id, otp, expiration });
  await otpEntry.save();

  await sendOtpEmailController(email, otp);

  res.json({ message: "OTP sent to your email" });
};


//////////////  send otp Email //////////////////////


 export const sendOtpEmailController = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user:  "dileep@singhsoft.com",
      pass:  "tayqbdxvlatmtrpf",
   
    }
  });

  const mailOptions = {
    from: EMAIL_USER,
    to: "dileepmeena975@gmail.com",
    subject: "OTP for Password Reset",
    text: `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`
  };

  await transporter.sendMail(mailOptions);
};


/////////////////////// verify otp //////////////////////////////

export const verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const otpEntry = await otpModel.findOne({ userId: user._id, otp });

  // const otpEntry = "746ac0"

  if (!otpEntry || otpEntry.expiration < new Date()) {
    return res.status(400).json({ message: "OTP is invalid or expired" });
  }

  user.isPasswordResetInProgress = true;
  await user.save();

  res.json({ message: "OTP verified. You can now reset your password" });
};


/// Update user profile photo

export const updateProfilePicController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    console.log(req.user._id)
    // file get from client photo
    const file = getDataUri(req.file);
    // delete prev image
    // await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    // update
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    // save func
    await user.save();
    res.status(200).send({
      success: true,
      message: "profile picture updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In update profile pic API",
      error,
    });
  }
};

// FORGOT PASSWORD

export const passwordResetController = async (req, res) => {
  try {
    // user get email || newPassword || answer
    const { email, newPassword } = req.body;
    // valdiation
    if (!email || !newPassword ) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }
    // find user
    const user = await userModel.findOne({ email  });
    //valdiation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "invalid user or answer",
      });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Your Password hasbeen  Reset Please Login !",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In password reset API",
      error,
    });
  }
};








