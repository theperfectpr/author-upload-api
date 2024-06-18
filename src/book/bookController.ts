import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";

const createBook = async(req: Request,res: Response,next: NextFunction) =>{
    // const {} = req.body;
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
        console.log(bookFileUploadResult); 
        console.log(uploadResult); 
    } catch (err) {
        console.log(err); 
        const error= createHttpError(500, 'Error uploading file');
        next(error);
    }
    
    // console.log(uploadResult);
    
    
    res.status(201).json({});
}

export {createBook};