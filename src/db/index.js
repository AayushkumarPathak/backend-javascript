import mongoose from "mongoose";
import { db_Name } from "../constants.js";

const connectDb = async () => {
    try {
        const connectionResponse = await mongoose.connect(
            `${process.env.MONGO_URI}/${db_Name}`
        );
        console.log(`MongoDb Connected!! Db Host: ${connectionResponse.connection.host}`);
        
    } catch (error) {
        console.log("MONGO Db connection Failed: ", error);
        process.exit(1);
    }
};

export default connectDb;
