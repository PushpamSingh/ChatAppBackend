import express from "express";
import { getCurrentUser, login, logout, onboard, registerUser } from "../Controllers/auth.controller.js";
import { VerifyJWT } from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/logout").post(VerifyJWT,logout);
router.route("/onboard").post(VerifyJWT,onboard);
router.route("/getcurrentuser").get(VerifyJWT,getCurrentUser)

export default router;