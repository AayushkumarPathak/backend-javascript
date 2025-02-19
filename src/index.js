
// require('dotenv').config({path:'./env'})

import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:'./env'
})



connectDb()
.then(()=>{
    const PORT = process.env.PORT || 5000;
    app.on("error",(error)=>{
        console.log("Error: ",error);
    })
    app.listen(PORT,()=>{
        console.log(`App running on port ${PORT}`);
        console.log(`Url: http://localhost:${PORT}`);
    })
})
.catch((error)=>{
    console.log("MongoDb Connection Failed: ",error);
});
































/*
import express from "express"
const app = express();



;(async () => {
    try {
       await mongoose.connect(`${process.env.MONGO_URI}/${db_Name}`)
       app.on("error",()=>{
        console.log("Error: ",error);
       });
       app.listen(process.env.PORT,()=>{
        console.log(`App running on port ${process.env.PORT}`);
        
       })
    } catch (error) {
        console.error("ERROR",error);
        throw error;
    }
})()

*/