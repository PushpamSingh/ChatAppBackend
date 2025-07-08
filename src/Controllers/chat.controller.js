import { Asynchandler } from "../Utils/Asynchandler.utils.js";
import { ApiError } from "../Utils/ApiError.utils.js";
import { Apiresponse } from "../Utils/ApiResponse.utils.js";
import { isValidObjectId } from "mongoose";
import {generateStreamToken} from "./../DB/stream.js"

const genStreamToken=Asynchandler(async(req,res)=>{
    try {
        const userId=req.user._id;
        if(!isValidObjectId(userId)){
            throw new ApiError(401,"Unauthorized - Invalid userId")
        }
        const token=await generateStreamToken(userId);
        return res.status(200)
        .json(
            new Apiresponse(200,token,"Stream token fetched successfuly")
        )
    } catch (error) {
       res.status(500).json(
             new ApiError(500,error?.message)
        )
    }
})
export {genStreamToken}