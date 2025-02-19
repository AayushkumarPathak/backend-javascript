import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User}  from "../models/user.model.js"
import {uploadOnCloudinary} from "../services/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse";

const registerUser = asyncHandler( async (req,res) =>{
    /**
     * PROCESS TO REGISTER USER
     * 1. get user detail from frontend
     * 2. validation
     * 3. check if user already exists{username,email}
     * 4. check for images {avatar-req, cover-opt}
     * 5. upload them to cloudinary, check success uploaded
     * 6. create user object - create entry in db
     * 7. remove password and refresh token field from response
     * 8. check for user creation
     * 9. return response
     * **/
    //1.
    const {fullname,username,email,password} = req.body;

    if(
        [fullname,username,email,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required");
    }
    //2.
    const existedUser =  User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with username or email already exits");
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImgLocalPath = req.files?.coverImg[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImgLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }
    const user = await User.create({
        fullname,
        username:username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if(!createdUser){
        throw new ApiError(500,"Something went while registering the user");
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )


    console.log("email: ",email);
    

    
    
    
});

export { registerUser };


