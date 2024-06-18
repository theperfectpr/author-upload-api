import { User } from "../user/userType";

export interface Book{
    _id: string;
    title: string;
    author: User;
    genre: string;
    coverImage: string;
    file: string;//url-> file stored in cloudinary
    createdAt: Date;
    updatedAt: Date;
}