import mongoose from "mongoose";
import {ApiError} from "./../Utils/ApiError.utils.js";
import { DB_CONSTANT } from "../constant.js";
import dotenv from "dotenv";
dotenv.config();

export const connectDb=async()=>{
    try {
        const connectInstace=await mongoose.connect(`${process.env.MONGO_ATLAS_URI}/${DB_CONSTANT}`)
        console.log("Database connected successfully:: host :: ", connectInstace.connection.host)
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw new ApiError(500,error?.message);
    }
}