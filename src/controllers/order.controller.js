import Product from "../models/product.schema.js"
import Coupon from "../models/coupon.schema.js"
import Order from "../models/order.schema.js"
import asyncHandler from "../service/asyncHandler.js"
import CustomError from "../utils/CustomError.js"
import razorpay from "../config/razorpay.config.js"


export const  generateRazorpayOrderId  = asyncHandler(async(req,res)=>{
        
    const {products, couponCode} = req.body

    if(!products || !products.length === 0 ){
        throw new CustomError("No Product Found",400);
    }

    let toatlAmount=0;
    let discountAmount=0;

//verfiying the product calculation based on DB calls
    let productPriceCalc = Promise.all(
        products.map(async(product)=>{
            const {productId, count}= product

            const productFromDB =await Product.findById(productId)
            if(!productFromDB){
                throw new CustomError("No Product Found",401)
            }
            if(productFromDB.stock < count){
                 return res.status(400).json({
                    error: "Product quantity not in stock"
                 })
            }

            toatlAmount = productFromDB.price * count;
        })
    )

    await productPriceCalc ;
    
       // check for coupon discount, if applicable
       const checkDiscount = async(req,res)=>{
            if(couponCode){
                const coupon = await Coupon.findOne({code :couponCode})
                if(!coupon){
                    throw new CustomError("No Coupon Found",401);
                }
                if(!coupon.active){
                    return res.status(400).json({
                        error: "Coupon is not active anymore"
                     })
                }
                discountAmount =  (toatlAmount * coupon.discount) / 100;
                toatlAmount = toatlAmount -discountAmount
            }
       }

       await checkDiscount
    
    const options={
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${new Date().getTime()}`
    }

    const order = await razorpay.orders.create(options)

    if(!order){
        throw new CustomError("Unable to create Orders",400)
    }

    res.status(200).json({
        success: true,
        message: "razorpay order id generated successfully",
        order
    })
    
})


//Add order in database and update product stock

export const genrateOrder =asyncHandler(async(req,res)=>{
    
})