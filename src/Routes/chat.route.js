import express from "express";
import { VerifyJWT } from "../Middlewares/auth.middleware.js";
import { genStreamToken } from "../Controllers/chat.controller.js";

const router=express.Router();

router.route("/genstreamtoken").get(VerifyJWT,genStreamToken)

export default router;