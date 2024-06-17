import express from 'express';
import { createUser } from './userController';

const userRouter = express.Router();

//do not call this route directly, router will call on request
userRouter.post('/register',createUser)

export default userRouter;