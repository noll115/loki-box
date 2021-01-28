import { DocumentType } from "@typegoose/typegoose";
import { BoxClass, UserClass } from "../lib/mongoDB";
declare module 'express-serve-static-core' {
    export interface Request {
        currentUser: DocumentType<UserClass>
        currentBox: DocumentType<BoxClass>
    }
}