import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
const JWT_SECRET_KEY = "ecom"
// USER AUTH
// / Adjust path as needed

export const isAuth = async (req, res, next) => {
  console.log("Middleware is running");
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized User",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = JWT.verify(token, JWT_SECRET_KEY);
    console.log("decoded value", decoded)
    req.user = await userModel.findById(decoded._id).select("-password");

    if (!req.user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).send({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


// ADMIN AUTH
export const isAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(401).send({
      success: false,
      message: "admin only",
    });
  }
  next();
};

