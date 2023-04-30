import mongoose from "mongoose"


const collectionSchema = new mongoose.Schema({

    name: {
        type: String,
        required: ["true", "Please provide a collection name"],  //mongoose will automaticaly check and give error
        trim: true,
        maxLength : [
            120,
            "Collection name should not be more than 120 chars"
        ]
    }
        
},{timestamps:true})


export default mongoose.model("Collection",collectionSchema) 

//This will save as collections in database all thing will be in lowerCase and become prulers