import express from 'express';
import { createBook } from './bookController';
import multer from 'multer';
import path from 'node:path';


const bookRouter = express.Router();
const upload = multer({
    dest: path.resolve(__dirname, '../../public/data/uploads'),
    limits:{
        fileSize: 3e7//30mb,
    }
})

//do not call this route directly, router will call on request
//route, middleware->function, handler
bookRouter.post('/',upload.fields([{name: 'coverImage', maxCount:1},{name: 'book', maxCount:1}]), createBook);

export default bookRouter;