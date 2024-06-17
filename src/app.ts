import express from 'express';
import createHttpError from 'http-errors';
import { globalErrorHandler } from './middlewares/globalErrorHandler';


const app = express();

app.get('/', (req, res) => {
    // const error = createHttpError(404, 'Something went wrong');
    // throw error;

    res.json({ message: 'Elib api is running' });
});


app.use(globalErrorHandler);

export default app;