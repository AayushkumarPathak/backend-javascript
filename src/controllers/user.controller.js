import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessTokenAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        const savedUser = await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken};
    }
    catch(error){
        throw new ApiError(
            500, 
            "Something went wrong while generating refresh and access token"
        );
    }
}

const registerUser = asyncHandler(async (req, res) => {
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
    const { fullName, username, email, password } = req.body;
    //2.
    if (
        [fullName, username, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    //3.
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "User with username or email already exits");
    }
    //4.
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // ** NOTE: optional chaining giving undefined so used classic check way.
    let coverImageLocalPath;

    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    //5.
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }
    //6.
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });
    //7
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    //8.
    if (!createdUser) {
        throw new ApiError(500, "Something went while registering the user");
    }
    //9.
    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );

    console.log("email: ", email);
});

const loginUser = asyncHandler( async(req,res)=>{
    /**
     * 1 from req.body get data
     * 2. username or email
     * 3. find the user
     * 4. check password
     * 5. access and refresh token
     * 6. send cookies
     * 7. response -> success login
     */
    const {email, username, password} = req.body;

    if(!username  || !email){
        throw new ApiError(400,"Username or password is required");
    }
    const user = await User.findOne({
        $or: [{username},{email}]
    });
    
    if(!user){
        throw new ApiError(404,"User doesnot exits");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials");
    }

    const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user._id);


    //now here we have to send cookie in user but this.user has empty refreshToken
    // now a/q to scenario we can update this user either make db call if not expensive
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //server modifiable only
    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,
                accessToken:accessToken,
                refreshToken:refreshToken
            },
            "User loggedIn Succesfully"
        )
    )
});

const logoutUser = asyncHandler(async(req,res)=>{
    //clear cookies , clear refreshToken from db
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    

    const options = {
        httpOnly:true,
        secure:true
    }
    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json( new ApiResponse(200,{},"User logged Out Successfully"))
    
});

export { 
    registerUser,
    loginUser,
    logoutUser
 };
