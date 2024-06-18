import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userType";

const createUser = async (req: Request,res: Response,next: NextFunction) =>{

    const {name, email, password} = req.body;
    console.log(req.body);
    
    //validation
    if(!name || !email || !password){
        const error = createHttpError(400, "Fields are required");
        return next(error);
    }
    //database call

    try{
        const user = await userModel.findOne({email});
        if(user){
            const error = createHttpError(400,"User already exists with this email");
            return next(error);
        }
        
    }
    catch(err){
        const error = createHttpError(500, "Database error while adding user");
        return next(error);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let newUser: User;
    try{
        newUser = await userModel.create({
            name,
            email,
            password: passwordHash
        })
    }
    catch(err){
        const error = createHttpError(500, "Database error while creating user");
        return next(error);
    }

    //token generation with JWT
    let token;
    try{
        token = sign({sub: newUser._id}, config.jwtSecret as string,{expiresIn: "1d"});
    }
    catch(err){
        const error = createHttpError(500, "Error while generating token");
        return next(error);
    }

    //process

    //response

    res.json({accessToken: token});
}

const loginUser = async (req: Request,res: Response,next: NextFunction) =>{

    const {email, password} = req.body;

    if(!email || !password){
        const error = createHttpError(400, "Fields are required");
        return next(error);
    }
    let user;
    try{
        user = await userModel.findOne({email});
        if(!user){
            const error = createHttpError(401, "User not found");
            return next(error);
        }
    }
    catch(err){
        const error = createHttpError(500, "Database error while logging in");
        return next(error);
    }

    
    const isMatched = await bcrypt.compare(password, user.password);
    try{
        if(!isMatched){
            const error = createHttpError(401, "Invalid password");
            return next(error);
        }
    }
    catch(err){
        const error = createHttpError(500, "Error while comparing password");
        return next(error);
    }
    let token;
    try{
        token = sign({sub: user._id}, config.jwtSecret as string,{expiresIn: "1d"});
    }
    catch(err){
        const error = createHttpError(500, "Error while generating token");
        return next(error);
    }

    res.status(201).json({accessToken: token});
}

//module export
export {createUser,loginUser};