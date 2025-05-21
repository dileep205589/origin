import express from "express";

// import { passwordResetController } from "../controllers/userController.js";

import { createProductController , deleteProductController, deleteProductImageController, getALLProductsController, getSingleProductController, updateProductController, updateProductImageController } from "../controllers/productController.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router()

// get-all 
router.get("/get-all", getALLProductsController);

// get by id 
router.get("/:id", getSingleProductController);

// create 
router.post("/create", singleUpload,  createProductController )

// update Product
router.put("/:id", updateProductController);

// update Product Image
router.put("/image/:id",  singleUpload, updateProductImageController);

// delete image 
router.delete("/delete-image/:id", deleteProductImageController );

/// delete product  
router.delete("/delete/:id",  deleteProductController ); 
  

export default router;


