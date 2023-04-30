import Collection from "../models/collection.schema.js"
import asyncHandler from "../service/asyncHandler.js"
import CustomError from "../utils/CustomError.js"


//Create Collection

export const createCollection  = asyncHandler(async(req,res)=>{ 

    const {name} = req.body

    if(!name){
        throw new CustomError("collection name is required",400)
    }

    const collection = await Collection.create({
        name
    })

    res.status(200).json({
        success: true,
        message: "Collection was created successfully",
        collection
    })
})


//updateCollection 

export const updateCollection = asyncHandler(async(req,res)=>{
    const {name} =req.body
    //grabing id of collection from the URL or route 
    const {id: collectionId} = req.params
    

    if(!name){
        throw new CustomError("collection name is required",400)
    }

    let updatedCollection = await Collection.findByIdAndUpdate(collectionId,{
       name
    },{
        new :true,
        runValidators:true
    })

    if(!updatedCollection){
        throw new CustomError("Collection not found",400)
    }

    res.status(200).json({
        success:true,
        message: "Collection was updated successfully",
        updatedCollection
    })

})


//deleteCollection 

export const deleteCollection = asyncHandler(async(req,res)=>{
    const {id : collectionId} =req.params

    const collectionToDelete = await Collection.findById(collectionId)
    
    if (!collectionToDelete) {
        throw new CustomError("Colection to be deleted not found", 400)
    }

    await collectionToDelete.remove()

    res.status(200).json({
        success: true,
        message: "Collection deleted successfully",
        
    })
})

//Get All Collection

export const getAllCollection = asyncHandler(async(req,res)=>{

   
    const collections = await Collection.find()
    
    if (!collections) {
        throw new CustomError("No collection found", 400)
    }

    res.status(200).json({
        success: true,
        collections
        
    })

})


