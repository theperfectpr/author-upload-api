import express from 'express';
import { createBook, getSingleBook, listBooks, updateBook } from './bookController';
import multer from 'multer';
import path from 'node:path';
import authenticate from '../middlewares/authenticate';


const bookRouter = express.Router();
const upload = multer({
    dest: path.resolve(__dirname, '../../public/data/uploads'),
    limits:{
        fileSize: 1e7//10mb,
    }
})


//do not call this route directly, router will call on request
//route, middleware->function, handler
bookRouter.post('/',authenticate,upload.fields([{name: 'coverImage', maxCount:1},{name: 'file', maxCount:1}]), createBook);
bookRouter.patch('/:bookId',authenticate,upload.fields([{name: 'coverImage', maxCount:1},{name: 'file', maxCount:1}]), updateBook);
bookRouter.get('/', listBooks);
bookRouter.get('/:bookId', getSingleBook);

export default bookRouter;