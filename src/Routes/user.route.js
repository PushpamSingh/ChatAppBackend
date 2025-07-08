import express from "express";
import { VerifyJWT } from "../Middlewares/auth.middleware.js";
import { acceptFriendRequest, getFriendRequest, getMyFriends, getOutgoingFriendRequest, getRecommendedUsers, sendFriendRequest } from "../Controllers/user.controller.js";

const router=express.Router();

router.route("/getrecommendedusers").get(VerifyJWT,getRecommendedUsers);
router.route("/getmyfriends").get(VerifyJWT,getMyFriends);
router.route("/sendfriendrequest/:id").post(VerifyJWT,sendFriendRequest);
router.route("/acceptfriendrequest/:id").put(VerifyJWT,acceptFriendRequest);
router.route("/getfriendrequest").get(VerifyJWT,getFriendRequest);
router.route("/getoutgoingfriendrequest").get(VerifyJWT,getOutgoingFriendRequest)

export default router