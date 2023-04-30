import Coupon  from "../models/coupon.schema.js"
import asyncHandler from "../service/asyncHandler.js"
import CustomError from "../utils/CustomError.js"


/**********************************************************
 * @CREATE_COUPON
 * @route https://localhost:5000/api/coupon
 * @description Controller used for creating a new coupon
 * @description Only admin and Moderator can create the coupon
 * @returns Coupon Object with success message "Coupon Created SuccessFully"
 *********************************************************/


export const createCoupon = asyncHandler(async (req, res) => {
    const {code,discount}=req.body

    if(!code || !discount){
        throw new CustomError("No Code Found",401)
    }

    //checking code already exist or not
    const existingCoupon = await Coupon.findOne({code})
    if(existingCoupon){
        throw new CustomError("Code Allready Exist",400)
    }

    //createing code
    const coupon =await Coupon.create({
        code,
        discount
    })

    res.status(200).json({
        success: true,
        message: "Coupon was created successfully",
        coupon,
    })

})

//updateCoupon


/**********************************************************
 * @UPDATED_COUPON
 * @route PUT /api/coupon/:id
 * @description Controller used for updating a coupon's active status
 * @description Only admin and Moderator can update the coupon
 * @returns {object} An updated Coupon object with a success message
*********************************************************/

export const updateCoupon = asyncHandler(async(req,res)=>{
    const {id: couponId} = req.params
    const {action}=req.body


    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId ,{
        active:action
    },{
        new :true,
        runValidators:true
    })

    if(!updatedCoupon){
        throw new CustomError("Coupon not found",400)
    }

    res.status(200).json({
        success:true,
        message:"Coupon Updated Succesfuly",
        updateCoupon
    })

})
//deleteCoupon 

/**********************************************************
 * @DELETE_COUPON
 * @route DLETE /api/coupon/:id
 * @description Controller used for deleting a coupon
 * @description Only admin and Moderator can delete the coupon
 * @returns {object} A success message indicating that the coupon was deleted successfullye
*********************************************************/

export const deleteCoupon = asyncHandler(async(req,res)=>{
    const {id: couponId} = req.params

    // const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
    const coupontoDelete = await Coupon.findById(couponId)


    if(!coupontoDelete){
        throw new CustomError("Coupon Not Found",400)
    }

    await coupontoDelete.remove()

    res.status(200).json({
        success:true,
        message:"Coupon deleted succesfully"
    })

})

//getAllCoupons 

/**********************************************************
 * @GETALL_COUPON
 * @route GET /api/coupon
 * @description Controller used for getting all coupons
 * @description Any authenticated user can get all coupons
 * @returns {object} An array of coupon objects
*********************************************************/


export const getAllCoupons = asyncHandler(async(req,res)=>{
    const allCoupons = await Coupon.find()

    if(!allCoupons){
        throw new CustomError("No Coupons Found",400)
    }

    res.status(200).json({
        success:true,   
        allCoupons
    })
})