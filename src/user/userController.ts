import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

const createUser = async (req: Request,res: Response,next: NextFunction) =>{

    const {name, email, password} = req.body;
    console.log(req.body);
    
    //validation
    if(!name || !email || !password){
        const error = createHttpError(400, "Fields are required");
        return next(error);
    }
    //database call
    const user = await userModel.findOne({email});
    if(user){
        const error = createHttpError(400,"User already exists with this email");
        return next(error);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
        name,
        email,
        password: passwordHash
    });

    //token generation with JWT
    const token = sign({sub: newUser._id}, config.jwtSecret as string,{expiresIn: "1d"});


    //process

    //response

    res.json({accessToken: token});
}

//module export
export {createUser};