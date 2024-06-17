import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

//Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const globalErrorHandler = ((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || 500;
    return res.status(statusCode).json({
        message: err.message,
        errorStack: config.env === 'development' ? err.stack : ''
    });
})