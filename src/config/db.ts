import { config } from "./config";
import mongoose from "mongoose";

const connectDB = async () => {
    try{
        mongoose.connection.on('connected', () => {
            console.log('Connected to DB');
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mongoose.connection.on('error', (err: any) => {
            console.log('Error connecting to DB');
            console.log(err);
        });
        await mongoose.connect(config.databaseUrl as string);
    }
    catch(err){
        console.log('Failed DB connection');
        console.log(err);
        process.exit(1);
    }
}

export default connectDB;
