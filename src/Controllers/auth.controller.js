import {Asynchandler} from "../Utils/Asynchandler.utils.js"
import { User } from "../Models/User.model.js"
import { ApiError } from "../Utils/ApiError.utils.js"
import { Apiresponse } from "../Utils/ApiResponse.utils.js"
import { isValidObjectId } from "mongoose"
import { upsertStreamUser } from "../DB/stream.js"

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId);
        if(!user){
            throw new ApiError(404,"user not found in generate token")
        }
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        // console.log("accesstoken, refreshToken: ",accessToken,refreshToken);
        
        return {accessToken,refreshToken}
    } catch (error) {
        console.log("Error :: generatetoken :: ",error);
        throw error;
    }
}
const registerUser=Asynchandler(async(req,res)=>{
    try {
        const {email,fullname,password}=req.body;

        if([email.fullname,password].some((curr)=>curr?.trim==="")){
            throw new ApiError(400,"All Fields are required");
        }

        if(password.length<6){
            throw new ApiError(403,"password must be at least 6 characters")
        }
        const emailregex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailregex.test(email)){
            throw new ApiError(400,"Invalid email formate");
        }

        const existingUser=await User.findOne({email});
        if(existingUser){
            throw new ApiError(403,"this email is already exist must use different email")
        }

        const idx=Math.floor(Math.random()*100)+1;
        const randomAvatar=`https://avatar.iran.liara.run/public/${idx}`

        const newUser=await User.create({
            fullname,
            email,
            password,
            profilePic:randomAvatar
        })
        await newUser.save({validateBeforeSave:false});

        //TODO : Create the user stream as well
        try {
            await upsertStreamUser({
                id:newUser._id.toString(),
                name:newUser.fullname.toString(),
                image:newUser.profilePic.toString() || ""
            })
            console.log(`new Stream user created ${newUser.fullname}`);
            
        } catch (error) {
            console.log("Error in creating stream user: ",error);
            throw error;
        }

        const getUser=await User.findOne({email}).select("-password -refreshToken")

        if(!getUser){
            throw new ApiError(500,"Database error visit site after some time")
        }
        res.status(201).json(
            new Apiresponse(201,getUser,"user register successfully")
        )

    } catch (error) {
        res.status(500).json(
             new ApiError(500,error?.message)
        )
    }
})

const login=Asynchandler(async(req,res)=>{
    try {
        const {email,password}=req.body;

        if(!(email || password)){
            throw new ApiError(400,"email and password are required")
        }

        const emailregex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailregex.test(email)){
            throw new ApiError(400,"Invalid email formate");
        }

        const user=await User.findOne({email})
        if(!user){
            throw new ApiError(400,"email is incorrect");
        }

        
        const isPasswordmatch=await user.comparePassword(password);
        // console.log("Email and password: ",email,password);
        if(!isPasswordmatch){
            throw new ApiError(400,"Password is incorrect");
        }

        const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);

        // const loginuser=await User.findById(user._id).select("-password -refreshToken")

        // if(!loginuser){
        //     throw new ApiError(500,"Database error try sometimes latter")
        // }
        const option={
            httpOnly:true,
            secure:false,
            sameSite:'None'
        }

        res.status(200)
        .cookie('accessToken',accessToken,option)
        .cookie('refreshToken',refreshToken,option)
        .json(
            new Apiresponse(
                200,
                {user,refreshToken,accessToken},
                "User login successfuly"
            )
        )
    } catch (error) {
        // console.log("error in login :" ,error);
        
       res.status(500).json(
             new ApiError(500,error?.message)
        )
    }
})

const logout=Asynchandler(async(req,res)=>{
    try {
        const userId=req.user?._id;
        if(!isValidObjectId(userId)){
            throw new ApiError(400,"Invalid action")
        }
        const logoutuser= await User.findByIdAndUpdate(
            userId,
            {
                $set:{
                    refreshToken:null
                }
            },
            {
                new:true
            }
        )
        const option={
            httpOnly:true,
            secure:false,
            sameSite:'None'
        }
        res.status(200)
        .cookie('accessToken',option)
        .cookie('refreshToken',option)
        .json(
            new Apiresponse(
                200,
                logoutuser,
                "User logout successfuly"
            )
        )
    } catch (error) {
        res.status(500).json(
             new ApiError(500,error?.message)
        )
    }
})

const onboard=Asynchandler(async(req,res)=>{
    try {
        const{fullname,bio,nativeLanguage,learningLanguage,location}=req.body;
        const userId=req.user?._id;

        // console.log("data",fullname);
        
        if(!isValidObjectId(userId)){
            throw new ApiError(401,"Invalid userId")
        }
        if(!(fullname || bio || nativeLanguage || learningLanguage || location)){
            return res.status(404)
            .json({
                message:"All Fileds are required",
                missingfield:[
                    !fullname && "fullname",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location"
                ].filter(Boolean)
            }
            )
        }

        const updatedUser=await User.findByIdAndUpdate(
            userId,
            {
                ...req.body,
                isOnboarded:true
            },
            {
                new:true
            }
        )

        if(!updatedUser){
            throw new ApiError(401,"Unauthorized - user not found")
        }

        //TODO: create stream user update as well
        try {
            await upsertStreamUser({
                id:updatedUser._id.toString(),
                name:updatedUser.fullname.toString(),
                image:updatedUser.profilePic.toString() || ""
            })
            console.log(`new Stream user updated ${updatedUser.fullname}`);
        } catch (error) {
            console.log("Error in updating stream user: ",error);
            throw error;
        }

        return res.status(200)
        .json(
            new Apiresponse(200,updatedUser,"User updated successfuly")
        )
    } catch (error) {
        res.status(500).json(
             new ApiError(500,error?.message)
        )
    }
})

const getCurrentUser=Asynchandler(async(req,res)=>{
    try {
        const userId=req.user?._id;
        if(!isValidObjectId(userId)){
            throw new ApiError(401,"Uauthorized - Invalid User Id");
            
        }

        return res.status(200)
        .json(
            new Apiresponse(
                200,
                req?.user,
                "Current User Fetched successfuly"
            )
        )
    } catch (error) {
       res.status(500).json(
             new ApiError(500,error?.message)
        )
    }
})

export {
    registerUser,
    login,
    logout,
    onboard,
    getCurrentUser
}