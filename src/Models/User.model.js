import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userSchema=new mongoose.Schema({
    fullname:{
        type:String,
        required:[true,'name is required']   
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlen:6
    },
    bio:{
        type:String,
        default:""
    },
    profilePic:{
        type:String,
        default:"",
    },
    nativeLanguage:{
        type:String,
        default:""
    },
    learningLanguage:{
        type:String,
        default:""
    },
    location:{
        type:String,
        default:""
    },
    isOnboarded:{
        type:Boolean,
        default:false
    },
    refreshToken:{
        type:String
    },
    friend:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ]

},{timestamps:true})


userSchema.pre('save',async function(next){
    const user=this
    if(!this.isModified('password')) return next()

        try {
            const salt=await bcrypt.genSalt(10);
            const hashPass=await bcrypt.hash(user.password,salt);
            user.password=hashPass;
            return next()
        } catch (error) {
            next(error)
            throw error
        }
})

userSchema.methods.comparePassword=async function(userpassword){
    try {
        const ismatch=await bcrypt.compare(userpassword,this.password)
        return ismatch;
    } catch (error) {
        throw error
    }
}

userSchema.methods.generateAccessToken= function() {
    return jwt.sign(
        {
            _id:this._id,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken= function() {
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model('User',userSchema)