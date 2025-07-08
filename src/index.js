import { app } from "./app.js";
import { connectDb } from "./DB/db.js";
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;

connectDb().then(()=>{
   app.listen(PORT,()=>{
    console.log("Server is running on port: ",PORT)
    })
}).catch((err)=>{
    console.log("Error connecting to the database:", err);
    throw err;
})

app.get('/',(req,res)=>{
    res.send("hello world")
})