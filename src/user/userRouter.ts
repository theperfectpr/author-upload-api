import express from 'express';
import { createUser, loginUser } from './userController';

const userRouter = express.Router();

//do not call this route directly, router will call on request
userRouter.post('/register',createUser)

userRouter.post('/login',loginUser);

export default userRouter;