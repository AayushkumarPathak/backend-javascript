import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors";




const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));


/**
 * Now if request coming in multiple form like json, body-json, form etc. 
 * We have to also limit upcoming json, to resist server from crash.
 * cookie-parser provide CRUD operation on user browser to save and retrive cookie
 * sometime data comes from url like google search hitesh choudhry -> google.com/?hitesh+choudhry
**/

app.use(express.json({
    limit:"16kb"
}));

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}));

app.use(express.static("public"));
app.use(cookieParser());

//Routes 
import userRouter from "./routes/user.route.js";

app.use("/api/v1/user",userRouter)


export { app };