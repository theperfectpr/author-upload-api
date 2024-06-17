import express from 'express';
import createHttpError from 'http-errors';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import userRouter from './user/userRouter';


const app = express();

app.get('/', (req, res) => {
    // const error = createHttpError(404, 'Something went wrong');
    // throw error;

    res.json({ message: 'Elib api is running' });
});

app.use("/api/users",userRouter);

app.use(globalErrorHandler);

export default app;