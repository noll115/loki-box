import { DocumentType } from "@typegoose/typegoose";
import * as socketio from "socket.io";
import { BoxClass, Roles, UserClass } from "../lib/mongoDB";

export class HttpException extends Error {
    status: number;
    constructor(status: number, msg: string) {
        super(msg);
        this.status = status;
    }
}

export interface JWTUserData {
    user: {
        id: string,
        role: Roles
    }
}

export interface JWTBoxData {
    user: {
        id: string
    }
}

export interface NameSpaces {
    user: socketio.Namespace,
    box: socketio.Namespace
}



export interface TokenSocket extends socketio.Socket {
    decoded_token: JWTBoxData | JWTUserData;
}

export interface UserSocket extends TokenSocket {
    user: DocumentType<UserClass>
}

export interface BoxSocket extends TokenSocket {
    box: DocumentType<BoxClass>
}

export interface INewBox {
    boxID: string,
    boxName: string,
    seenAs: string
}

