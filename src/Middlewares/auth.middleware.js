import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {ApiError} from "./../Utils/ApiError.utils.js"
import {Apiresponse} from  "./../Utils/ApiResponse.utils.js" 
import { User } from "../Models/User.model.js";
dotenv.config()

export const VerifyJWT=async(req,res,next)=>{
    try {
        //  console.log("Incoming cookies:", req.cookies);
        const token = req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ","");

        if(!token){
            throw new ApiError(401,"Unauthorized - Token not found")
        }
       try {
         const decodeToken=await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
         if(!decodeToken){
             throw new ApiError(401,"Unauthorized - Invalid Token")
         }
       } catch (error) {
         next(error)
            res.status(500).json(
             new ApiError(404,error?.message)
        )
       }

        const user=await User.findById(decodeToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(404,"Unauthorized - User not found goto log in page")
        }
        req.user=user;
        next()
    } catch (error) {
        // console.log("Error :: verifyJWT :: ",error);    
        next(error)
        res.status(500).json(
             new ApiError(500,error?.message)
        )
       
    }
}