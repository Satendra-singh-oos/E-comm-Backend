import Product from "../models/product.schema.js"
import formidable from "formidable"
import {s3DeleteFile,s3FileUpload} from "../service/imageUpload.js"
import mongoose, { Mongoose }  from "mongoose"
import CustomError from "../utils/CustomError.js"
import asyncHandler from "../service/asyncHandler.js"
import config from "../config/index.js"
import fs from "fs"



/**********************************************************
 * @ADD_PRODUCT
 * @route https://localhost:5000/api/product
 * @description Controller used for creating a new product
 * @description Only admin can create the coupon
 * @descriptio Uses AWS S3 Bucket for image upload
 * @returns Product Object
 *********************************************************/


export const addProduct = asyncHandler(async (req,res) =>{
    const form = formidable({ multiples: true , keepExtensions:true });

    form.parse(req, async function (err, fields, files){
          
        if(err){
            throw new CustomError(err.message || "there is something went wrong i guess in form",500)
        }

        let productId = new Mongoose.Types.ObjectId().toHexString()

        console.log(fields, files);

        if(!fields.name || !fields.price || !fields.description || !fields.collectionId){
           throw new CustomError("Please fill the name ,price ,description and collectionId",500)
        }

        let imgArrayResp = Promise.all(
            Object.keys(files).map(async (file,index) =>{
                const element = file[fileKey]
                //console.log(element);
                const data = fs.readFileSync(element.filepath)

               const upload = await s3FileUpload({
                    bucketName:config.S3_BUCKET_NAME,
                    key: `products/${productId}/photo_${index + 1}.png`,
                    body:data,
                    contentType: element.mimetype
                })

               // console.log(upload);

               return{
                secure_url : upload.Location
               }
            })
        )

        let imgArray =await imgArrayResp

        const product =await Product.create({
            _id:productId,
            photo:imgArray,
            ...fields
            //fields.name //fields.price ... etc
        })

        if(!product){
            throw new CustomError("Product failed to save in DB",400)
        }

        res.status(200).json({
            success: true,
            product,
        })
        
    })
})


//getAllProducts 

export const getAllProducts = asyncHandler(async(req,res)=>{
    const products = await Product.find({})
 
    if(!products){
      throw new CustomError("No Products Found in database",404);
    }
    res.status(200).json({
        success:true,
        products
    })
})


//getProductById 

export const getProductById =asyncHandler(async(req,res)=>{
    const {id:productId}=req.param;

    const product = await Product.findById(productId)

    if(!product){
        throw new CustomError("No Product Found in database",404);
    }

    res.status(200).json({
        success:true,
        product
    })
})


//getProductByCollectionId 

export const getProductByCollectionId = asyncHandler(async(req,res)=>{
    const {id : collectionId} = req.param

    const product = await Product.find({collectionId})

    if(!product){
        throw new CustomError("No Product Found in database",404);
    }

    res.status(200).json({
        success:true,
        product
    })
})

//deleteProduct 

export const deleteProduct = asyncHandler(async(req,res)=>{
    const {id:productId} = req.param;
 
    const product = await Product.find(productId)

    if (!product) {
        throw new CustomError("No product found", 404)

    }

    /*
    Steps to delete the photo
     1->resolve Promises
     2->loop through photos array
     3->once u lopping the photo delete each photo
     in order to delete we need to pass the bucketName and key
     how to grab the key ?-> we all key is stored in product._id we can create the path of the key again with it   
    */

     const deletePhotos = Promise.all(
        product.photos.map(async( elem, index) => {
            await s3DeleteFile({
                bucketName: config.S3_BUCKET_NAME,
                key: `products/${product._id.toString()}/photo_${index + 1}.png`
            })
        })
     )

     await deletePhotos;

     await product.remove()
     
     res.status(200).json({
        success: true,
        message: "Product has been deleted successfully"
    })

})



// //updateProduct

/* export const updatedProduct = asyncHandler(async(req,res) => {
    const {id:productId} = req.param;
 
    const product = await Product.find(productId)

    if (!product) {
        throw new CustomError("No product found", 404)

    }


 })*/
