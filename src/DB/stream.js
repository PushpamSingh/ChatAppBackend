import { StreamChat } from "stream-chat";
import dotenv from "dotenv";
// import { Asynchandler } from "../Utils/Asynchandler.utils";
dotenv.config()

const apiKey=process.env.STREAMING_API_KEY;
const apiSecret=process.env.STREAMING_API_SECRET;
if(!(apiKey || apiSecret)){
    console.error("Stream Api key and Secret key are required");
}
const streamClient=StreamChat.getInstance(apiKey,apiSecret);

const upsertStreamUser=async(userdata)=>{
    try {
        await streamClient.upsertUsers([userdata]);
        return userdata;
    } catch (error) {
        console.log("Error :: upsertStreamUser :: ".error);
        throw error;
    }
}

//TODO : do it latter
const generateStreamToken=async(userId)=>{
    try {
        const userIdStr=userId.toString();
        const token = await streamClient.createToken(userIdStr);
        return token;
    } catch (error) {
        console.log("Error :: generateStreamToken :: ".error);
        throw error;
    }
}

export {
    upsertStreamUser,
    generateStreamToken
}