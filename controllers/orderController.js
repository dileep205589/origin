import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { isAuth } from "../middlewares/authMiddleware.js";
import { stripe } from "../app.js";



export const createOrderController = async (req, res) => {
    try {
        const {
            shippingInfo,
            orderItems,
            paymentMethod,
            paymentInfo,
            itemPrice,
            tax,
            shippingCharges,
            totalAmount,
        } = req.body;
        console.log(req.body)

        // const price = req.body.orderItems[0].price
        // console.log(price)

        //valdiation
        // create order


        await orderModel.create({
            user: req.user._id,
            shippingInfo,
            orderItems,
            paymentMethod,
            paymentInfo,
            itemPrice,
            tax,
            shippingCharges,
            totalAmount,
        });

        // stock update 
        for (let i = 0; i < orderItems.length; i++) {
            // find product
            const product = await productModel.findById(orderItems[i].product);
            product.stock -= orderItems[i].quantity;
            await product.save();
        }

        res.status(201).send({
            success: true,
            message: "Order Placed Successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error In Create Order API",
            error,
        });
    }
}

////===========================================

export const getMyOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({ user: req.user._id })
        if (!orders) {
            return res.status(404).send({
                success: false,
                message: "User Not Found "
            })
        }

        return res.status(200).send({
            success: true,
            message: " Get MY Orders SuccessFully",
            totalOrder: orders.length,
            orders,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: "Error Get MY Order API "
        })
    }

}

////==================================================

export const singleOrderController = async (req, res) => {

    try {
        const order = await orderModel.findById(req.params.id)
        if (!order) {
            return res.status(404).send({
                success: false,
                message: "order Not Found "
            })
        }

        return res.status(200).send({
            success: true,
            message: " Get MY Orders SuccessFully",
            order,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: "Error Get MY Order API "
        })
    }

}

////========================================================

export const paymentController = async (req, res) => {
    try {
        const { totalAmount } = req.body;

        if (!totalAmount) {
            return res.status(400).send({
                success: false,
                message: "Total amount is required",
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(totalAmount),
            currency: 'usd',
        });

        return res.status(200).send({
            success: true,
            message: "PaymentIntent created successfully",
            client_secret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: "Payment creation failed",
            error: error.message,
        });
    }
};

/// getAll Orders 

export const getAllOrdersController = async (req , res ) => {
    try {
        const getall = await orderModel.find({})
        if (!getall) {
            res.status(404).send({
                success: false,
                message: "Error GetAll  User "
            })
        }
        res.status(200).send({
            success: true,
            message: "Get ALL Users Successfully "
        })
    } catch (error) {
        console.log(error)
        res.status(404).send({
            success: false,
            message: "Error Get All Order API Founding "
        })

    }
}
