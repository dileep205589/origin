import express from "express";
import { createOrderController, getMyOrdersController, paymentController, singleOrderController } from "../controllers/orderController.js";
import { isAuth } from "../middlewares/authMiddleware.js";

const router = express.Router()
//create order
router.post ("/create", isAuth, createOrderController )


//get all orders
router.get("/my-orders" , isAuth, getMyOrdersController)

//get single order
router.get("/my-order/:id" , isAuth, singleOrderController)

//// Payment Method 
router.post("/payments", isAuth , paymentController )
 


export default router;