import { NextFunction, Request, Response } from "express";

const createBook = async(req: Request,res: Response,next: NextFunction) =>{
    res.status(201).json({});
}

export {createBook};