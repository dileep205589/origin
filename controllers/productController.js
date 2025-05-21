import productModel from "../models/productModel.js"
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

export const getALLProductsController = async (req, res) => {
    try {
        const products = await productModel.find({})
        res.status(200).send({
            success: true,
            message: " All Product fatched  Successfully",
            products,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in Get  Products API "
        })
    }
};

////==========================================================================================

export const getSingleProductController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id)
        if (!product) {
            res.status(404).send({
                success: false,
                message: " Products  Not Found  "
            })
        }

        return res.status(200).send({
            success: true,
            message: "  Product fatched  Successfully By ID",
            product,
        })

    } catch (error) {
        console.log(error)
        if (error.name === "CastError") {
            return res.status(500).send({
                success: false,
                message: " Invalid  ID ",
            })
        }
    }
    res.status(500).send({
        success: false,
        message: "Error in Get  Products API "
    })
};

////============================================================================================

export const createProductController = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body
        // Validation
        if (!name || !description || !price || !stock) {
            res.status(500).send({
                success: false,
                message: "Please  Provided All Field  "
            })
        }
        if (!req.file) {
            res.status(500).send({
                success: false,
                message: "Please Provide Product Images "
            })
        }
        const file = getDataUri(req.file)
        const cdb = await cloudinary.v2.uploader.upload(file.content)
        const image = {
            public_id: cdb.public_id,
            url: cdb.secure_url
        }
        await productModel.create({
            name, description, price, category, stock, image: [image]
        })

        res.status(201).send({
            success: true,
            message: " Product Created Successfully "
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error Create Product API "
        })
    }
};

////================================================================================================

export const updateProductController = async (req, res) => {
    try {

        const product = await productModel.findById(req.params.id)
        if (!product) {
            res.status(404).send({
                success: false,
                message: " Product is not Found "
            })
        }
        const { name, description, price, category, stock } = req.body
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (category) product.category = category;
        if (stock) product.stock = stock;
        await product.save();
        return res.status(200).send({
            success: true,
            message: "Product Updated SucceessFully "
        })

    } catch (error) {
        console.log(error)
        if (error.name === "CastError") {
            return res.status(500).send({
                success: false,
                message: " Invalid  ID ",
            })
        }
    }
    res.status(500).send({
        success: false,
        message: "Error in Get  Products API "
    })
};

////===================================================================================================

export const updateProductImageController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id)
        if (!product)
            res.status(404).send({
                success: false,
                message: " Product is not Found "
            })

        if (!req.file) {
            res.status(500).send({
                success: false,
                message: "Please Provide Product Images "
            })
        }
        const file = getDataUri(req.file)
        const cdb = await cloudinary.v2.uploader.upload(file.content)
        const image = {
            public_id: cdb.public_id,
            url: cdb.secure_url
        }

        product.image.push(image)
        await product.save();
        return res.status(200).send({
            success: true,
            message: "Product Image  Updated SucceessFully "
        })

    } catch (error) {
        console.log(error)
        if (error.name === "CastError") {
            return res.status(500).send({
                success: false,
                message: " Invalid  ID ",
            })
        }
    }
    res.status(500).send({
        success: false,
        message: "Error in Get  Products API "
    })
};

////======================================================================================================

export const deleteProductImageController = async (req, res) => {
  try {
    // find produtc
    const product = await productModel.findById(req.params.id);
    // validatin
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product Not Found",
      });
    }
    // image id find
    const id = req.query.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "product image not found",
      });
    }
    let isExist = -1;
    product.image.forEach((item, index) => {
      if (item._id.toString() === id.toString()) isExist = index;
    });
    if (isExist < 0) {
      return res.status(404).send({
        success: false,
        message: "Image Not Found",
      });
    }
    // DELETE PRODUCT IMAGE
    await cloudinary.v2.uploader.destroy(product.image[isExist].public_id);
    product.image.splice(isExist, 1);
    await product.save();
    return res.status(200).send({
      success: true,
      message: "Product Image Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    // cast error ||  OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Get DELETE Product IMAGE API",
      error,
    });
  }
};

///======================================================================================================

export const deleteProductController = async(req , res) =>{
try {
 // find product
    const product = await productModel.findById(req.params.id);

 // validation
 if (!product) {
      return res.status(404).send({
        success: false,
        message: "product not found",
      });
    }
 // find and delete image cloudinary
    for (let index = 0; index < product.image.length; index++) {
      await cloudinary.v2.uploader.destroy(product.image[index].public_id);
    }
    await product.deleteOne();
    res.status(200).send({
      success: true,
      message: "PRoduct Deleted Successfully",
    });
} catch (error) {
 console.log(error);
    // cast error ||  OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Get DELETE Product IMAGE API",
      error,
    });
  }
}
///==========================================================================================================



