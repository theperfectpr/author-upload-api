import express from 'express';
import { createBook } from './bookController';

const bookRouter = express.Router();

//do not call this route directly, router will call on request
bookRouter.post('/',createBook);

export default bookRouter;