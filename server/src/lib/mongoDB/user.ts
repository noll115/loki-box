
import mongoose, { Model, Schema, VirtualType } from "mongoose";
import { IBoxDoc } from "./box";
import * as util from "../util";


export enum Roles {
    USER = "USER",
    ADMIN = "ADMIN"
}


interface IUserBoxBaseDoc {
    boxName: string,
    seenAs: string
}

export interface IUserBoxDoc extends IUserBoxBaseDoc {
    box: mongoose.Types.ObjectId
}

export interface IUserBoxPopulatedDoc extends IUserBoxBaseDoc {
    box: IBoxDoc
}


interface IBaseUserDoc extends mongoose.Document {
    email: string,
    password: string,
    role?: Roles,
    IsValidPassword(pass: string): boolean,
    AddBox(box: IUserBoxDoc): Promise<IUserDoc>
    RemoveBox(boxID: string): Promise<IUserDoc>
}

export interface IUserDoc extends IBaseUserDoc {
    boxes?: IUserBoxDoc[]
}
export interface IUserPopulatedDoc extends IBaseUserDoc {
    boxes?: IUserBoxPopulatedDoc[]
}

export interface IUserModel extends Model<IUserDoc> {

}


const UserSchema = new Schema<IUserDoc>({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, maxLength: 20 },
    role: { type: String, enum: Object.values(Roles), default: Roles.USER },
    boxes: {
        type: [{
            boxName: { type: String, required: true },
            seenAs: { type: String, required: true },
            box: { type: Schema.Types.ObjectId, ref: 'boxes' }
        }], default: []
    },
});

UserSchema.method({
    async IsValidPassword(this: IUserDoc, pass: string) {
        return await util.ValidatePass(pass, this.password);
    },
    async AddBox(this: IUserDoc, box: IUserBoxDoc) {
        this.boxes!.push(box);
        return await this.save()
    },
    async RemoveBox(this: IUserDoc, boxID: string) {
        return await this.updateOne({ $pull: { "boxes.box": boxID } }).exec();
    }
});



UserSchema.pre("save", async function (this: IUserDoc, next) {
    this.password = await util.HashPass(this.password);
    next();
});



export const User = mongoose.model<IUserDoc, IUserModel>("users", UserSchema);