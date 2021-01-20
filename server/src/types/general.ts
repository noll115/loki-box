import { Socket } from "socket.io";
import { IBoxDoc, IUserDoc, IUserPopulatedDoc, Roles } from "../lib/mongoDB";

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

export interface TokenSocket extends Socket {
    decoded_token: JWTBoxData | JWTUserData;
}

export interface UserSocket extends TokenSocket {
    user: IUserDoc | IUserPopulatedDoc
}

export interface BoxSocket extends TokenSocket {
    box: IBoxDoc
}