import { ApiError } from "../Utils/ApiError.utils.js";
import { Apiresponse } from "../Utils/ApiResponse.utils.js";
import { User } from "../Models/User.model.js";
import { Asynchandler } from "../Utils/Asynchandler.utils.js";
import { isValidObjectId } from "mongoose";
import { FriendReq } from "../Models/Friendreq.model.js";

const getRecommendedUsers=Asynchandler(async(req,res)=>{
    try {
        const currentUserId=req.user._id;
        if(!isValidObjectId(currentUserId)){
            throw new ApiError(401,"Unauthorized - Invalid user Id")
        }
        const currentUser=req.user;

        const RecommendedUsers=await User.find({
            $and:[
                {_id:{$ne:currentUserId}},//exclude current user
                {_id:{$nin:currentUser.friend}},//exclude current user's friends
                {isOnboarded:true}
            ]
        })

        return res.status(200)
        .json(
            new Apiresponse(200,RecommendedUsers,"recommended user fetched successfuly")
        )

    } catch (error) {
        res.status(500).json(
             new ApiError(500,error?.message)
        )
    }
})
const getMyFriends=Asynchandler(async(req,res)=>{
    try {
        const currentUserId=req.user?._id;
         if(!isValidObjectId(currentUserId)){
            throw new ApiError(401,"Unauthorized - Invalid user Id")
        }
        const currentUser=await User.findById(currentUserId).select("friend")
        .populate("friend","fullname profilePic nativeLanguage learningLanguage location")
        res.status(200)
        .json(
            new Apiresponse(
                200,
                currentUser.friend,
                "currentUser friend's fetch successfuly"
            )
        )
    } catch (error) {
         res.status(500).json(
             new ApiError(500,error?.message)
        )
    }
})

const sendFriendRequest=Asynchandler(async(req,res)=>{
    try {
        const myId=req.user?._id;
        const {id:recipientId}=req.params;

        if(!(isValidObjectId(myId) || isValidObjectId(recipientId))){
            throw new ApiError(401,"Unauthorized - Invalid your id or recipientId")
        }
        //! check you can send friend req youself
        if(myId===recipientId){
            throw new ApiError(401,"You can send friend request to youself")
        }

        //!find recipient
        const recipient=await User.findById(recipientId)
        if(!recipient){
            throw new ApiError(404,"! recipient not found")
        }

        //!check existing friend
        if(recipient.friend.includes(myId)){
            throw new ApiError(400,"you already friend with this user")
        }

        //!find existing req
        const existingReq=await FriendReq.findOne({
            $or:[
                {sender:myId,recipient:recipientId},
                {sender:recipientId,recipient:myId}
            ]
        })

        if(existingReq){
           throw new ApiError(400,"A friend request already exist between you and this user")
        }

        //!finaly send friend request
        const friendRequest=await FriendReq.create({
            sender:myId,
            recipient:recipientId
        })
        await friendRequest.save({validateBeforeSave:false})

        return res.status(200)
        .json(
            new Apiresponse(
                200,
                friendRequest,
                "friend request send successfuly"
            )
        )
    } catch (error) {
         res.status(500).json(
             new ApiError(500,error?.message)
        )
    }
})

const acceptFriendRequest=Asynchandler(async(req,res)=>{
    try {
        const myId=req.user?._id;
        const {id:requestId}=req.params;

        if(!(isValidObjectId(myId) || isValidObjectId(requestId))){
            throw new ApiError(401,"Unauthorized - Invalid yourId or requestId")
        }
     
        const friendRequest=await FriendReq.findOne({_id:requestId});
        if(!friendRequest){
            throw new ApiError(400,"friend request not found")
        }

        //!verify that current user is recipient
        if(friendRequest.recipient.toString() !== myId.toString()){
            throw new ApiError(401,"Unauthorized - you are not able to accept friend request")
        }

        //!accept friend request
        friendRequest.status="accepted";
        friendRequest.save({validateBeforeSave:false});

        //!once you accept the friend request then both of you become a friend
        //!then add each other id in friend array
        await User.findByIdAndUpdate(
            friendRequest.sender,
            {
                $addToSet:{friend:friendRequest.recipient}
            },
            {
                new:true
            }
        )

        const meuser= await User.findByIdAndUpdate(
            friendRequest.recipient,
            {
                $addToSet:{friend:friendRequest.sender}
            },
            {
                new:true
            }
        )

        return res.status(200)
        .json(
            new Apiresponse(200,meuser,"friend request accepted")
        )
    } catch (error) {
        res.status(500).json(
             new ApiError(500,error?.message)
        )
    }
})

const getFriendRequest=Asynchandler(async(req,res)=>{
    try {
        const incomingRequest=await FriendReq.find(
            {
                recipient:req.user?._id,
                status:"pending"
            },
        ).populate("sender","fullname profilePic nativeLanguage learningLanguage")

        const acceptedRequest=await FriendReq.find({
            sender:req.user?._id,
            status:"accepted"
        }).populate("recipient","profilePic fullname")

        return res.status(200)
        .json(
            new Apiresponse(200,{incomingRequest,acceptedRequest},"notification fetched successfuly")
        )
    } catch (error) {
      res.status(500).json(
             new ApiError(500,error?.message)
        )
    }
})

const getOutgoingFriendRequest=Asynchandler(async(req,res)=>{
    try {
        const getOutgoing=await FriendReq.find({
            sender:req.user?._id,
            status:"pending"
        }).populate("recipient","fullname profilePic nativeLanguage learningLanguage")

        return res.status(200)
        .json(
            new Apiresponse(200,getOutgoing,"outgoing fetch successfuly")
        )
    } catch (error) {
       res.status(500).json(
             new ApiError(500,error?.message)
        )
    }
})
export{
    getRecommendedUsers,
    getMyFriends,
    sendFriendRequest,
    acceptFriendRequest,
    getFriendRequest,
    getOutgoingFriendRequest
}
