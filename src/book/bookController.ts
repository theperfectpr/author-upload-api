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

const updateBook = async(req: Request,res: Response,next: NextFunction) =>{
    const {title, genre} = req.body;
    const bookId = req.params.bookId;
    try{
        const book = await bookModel.findOne({_id: bookId});
        if(!book){
            const error= createHttpError(404, 'Book not found');
            return next(error);
        }
        const _req = req as AuthRequest;
        if(book?.author.toString() !== _req.userId){
            const error = createHttpError(403, 'You are not the authorized to update this book');   
            return next(error);
        }
        const files = req.files as {[fieldname: string]: Express.Multer.File[]};
        let completeCoverImage = "";
        if(files.coverImage){
            const filename = files.coverImage[0].filename;
            const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1);
            const filePath = path.resolve(__dirname, '../../public/data/uploads', filename);
            completeCoverImage = filename
            const uploadResult = await cloudinary.uploader.upload(filePath,{
                filename_override: completeCoverImage,
                folder: 'book-covers',
                format: coverImageMimeType
            });
            completeCoverImage = uploadResult.secure_url;
            await fs.promises.unlink(filePath);
            //delete previous cover image
            try{
                const coverFileSplits = book.coverImage.split('/');
                const coverImagePublicId = coverFileSplits.at(-2) + '/' + (coverFileSplits.at(-1)?.split('.')[0]);
                await cloudinary.uploader.destroy(coverImagePublicId);
            }
            catch(err){
                console.log(err);
                const error= createHttpError(500, 'Error deleting cover image on update');
                return next(error);
            }
        }

        let completeFileName = "";
        if(files.file){
            const filename = files.file[0].filename;
            const filePath = path.resolve(__dirname, '../../public/data/uploads', filename);
            completeFileName = filename
            const uploadResult = await cloudinary.uploader.upload(filePath,{
                filename_override: completeFileName,
                folder: 'book-pdfs',
                resource_type:'raw',
                format: 'pdf'
            });
            completeFileName = uploadResult.secure_url;
            await fs.promises.unlink(filePath);
            //delet previous file
            try{
                const bookFileSplits = book.file.split('/');
                const bookFilePublicId = bookFileSplits.at(-2)+'/'+bookFileSplits.at(-1);
                await cloudinary.uploader.destroy(bookFilePublicId,{
                    resource_type: 'raw'
                });
            }
            catch(err){
                console.log(err);
                const error= createHttpError(500, 'Error deleting file on update');
                return next(error);
            }
        }

        try{
            const updatedBook = await bookModel.findOneAndUpdate({_id: bookId}, 
                {
                    title,
                    genre,
                    coverImage: completeCoverImage || book.coverImage,
                    file: completeFileName || book.file
                },
                {new: true}
            )
            res.status(201).json(updatedBook);
        }
        catch(err){
            console.log(err);
            const error= createHttpError(500, 'Error updating book');
            return next(error);
        }
    }
    catch(err){
        console.log(err);
        const error= createHttpError(500, 'Error updating book');
        return next(error);
    }
}

const listBooks = async(req: Request,res: Response,next: NextFunction) =>{
    try{
        const book = await bookModel.find();
        res.status(200).json(book);
    }
    catch(err){
        console.log(err);
        const error= createHttpError(500, 'Error listing books');
        return next(error);
    }
}

const getSingleBook = async(req: Request,res: Response,next: NextFunction) =>{
    const bookId = req.params.bookId;
    try{
        const book = await bookModel.findOne({_id: bookId});
        if(!book){
            const error= createHttpError(404, 'Book not found');
            return next(error);
        }
        res.status(200).json(book);
    }
    catch(err){
        console.log(err);
        const error= createHttpError(500, 'Error getting book with given id');
        return next(error);
    }
}

const deleteBook = async(req: Request,res: Response,next: NextFunction) =>{
    const bookId = req.params.bookId;
    try{
        const book = await bookModel.findOne({_id: bookId});

        const _req = req as AuthRequest;
        if(book?.author.toString() !== _req.userId){
            const error = createHttpError(403, 'You are not the authorized to update this book');   
            return next(error);
        }
        if(!book){
            const error= createHttpError(404, 'Book not found');
            return next(error);
        }
        try{
            const coverFileSplits = book.coverImage.split('/');
            const coverImagePublicId = coverFileSplits.at(-2) + '/' + (coverFileSplits.at(-1)?.split('.')[0]);
            await cloudinary.uploader.destroy(coverImagePublicId);
        }
        catch(err){
            console.log(err);
            const error= createHttpError(500, 'Error deleting cover image');
            return next(error);
        }

        try{
            const bookFileSplits = book.file.split('/');
            const bookFilePublicId = bookFileSplits.at(-2)+'/'+bookFileSplits.at(-1);
            await cloudinary.uploader.destroy(bookFilePublicId,{
                resource_type: 'raw'
            });
        }
        catch(err){
            console.log(err);
            const error= createHttpError(500, 'Error deleting book file');
            return next(error);
        }

        await bookModel.deleteOne({_id: bookId});
        res.sendStatus(204);
    }
    catch(err){
        console.log(err);
        const error= createHttpError(500, 'Error deleting book with given id');
        return next(error);
    }
}

export {createBook, updateBook, listBooks, getSingleBook, deleteBook};