import mongoose from "mongoose"
import app from "./src/app.js";
import config from "./src/config/index.js";

//iifey way used to run this function as soon as the index.js init

(async ()=>{
    try {
   await mongoose.connect(config.MONGODB_URL);
   console.log("DB CONNECTED !");

   //if some error which is releated to server side (express) which can't be handel by the catch bolock we need to take care aobut that

   app.on('error',(err)=>{
    console.error("ERROR : ",err);
    throw err
   })

   const onListening = () =>{
    console.log(`Listing on port ${config.PORT}`);
   }

   app.listen(config.PORT, onListening)
   
    
    } catch (err) {
        console.error("ERROR : ", err)
        throw err
    }
})()