import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs"
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async(req: Request,res: Response,next: NextFunction) =>{
    const {title, genre} = req.body;
    // console.log(req.files);
    const files = req.files as {[fieldname: string]: Express.Multer.File[]};
    const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1);
    const filename = files.coverImage[0].filename;
    const filePath = path.resolve(__dirname, '../../public/data/uploads', filename);

    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(__dirname, '../../public/data/uploads', bookFileName);

    try {

        const uploadResult = await cloudinary.uploader.upload(filePath,{
            filename_override: filename,
            folder: 'book-covers',
            format: coverImageMimeType
        });

        const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath,{
            resource_type: 'raw',
            filename_override: bookFileName,
            folder: 'book-pdfs',
            format: 'pdf'
        });

        const _req = req as AuthRequest;

        const newBook = await bookModel.create({
            title,
            genre,
            author:_req.userId,
            coverImage: uploadResult.secure_url,
            file: bookFileUploadResult.secure_url,
        });

        try{
            await fs.promises.unlink(filePath);
            await fs.promises.unlink(bookFilePath);
        }
        catch(err){
            console.log(err);
            const error= createHttpError(500, 'Error deleting file');
            next(error);
        }
        res.status(201).json({id: newBook.id});
    } catch (err) {
        console.log(err); 
        const error= createHttpError(500, 'Error uploading file');
        next(error);
    }  
}

export {createBook};