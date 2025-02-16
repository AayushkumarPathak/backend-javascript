
// require('dotenv').config({path:'./env'})

import dotenv from "dotenv";
import connectDb from "./db/index.js";

dotenv.config({
    path:'./env'
})

connectDb();
































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