import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

export const app=express();

app.use(cors(
    {
        origin:[process.env.CORS_ORIGIN1, process.env.CORS_ORIGIN2, process.env.CORS_ORIGIN3,"http://localhost:5173","*"],
        credentials:true,
        optionsSuccessStatus: 200,
    }
))
app.set('trust proxy', 1); // trust first proxy
app.use(express.json("limit:16kb"));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

import authRouter from "./Routes/auth.route.js";
import userRouter from "./Routes/user.route.js";
import chatRouter from "./Routes/chat.route.js";

app.use('/api/v1/auth',authRouter)
app.use('/api/v1/user',userRouter)
app.use('/api/v1/chat',chatRouter)
