
import mongoose, { Document, Model, Schema, VirtualType } from "mongoose";
import { BoxClass } from "./box";
import * as util from "../util";
import { DocumentType, getModelForClass, isDocument, isDocumentArray, isRefType, modelOptions, pre, prop, Ref } from "@typegoose/typegoose";


export enum Roles {
    USER,
    ADMIN
}



export class UserBoxesClass {
    @prop({ required: true })
    public boxName!: string

    @prop({ required: true })
    public seenAs!: string

    @prop({ ref: () => BoxClass })
    public box!: Ref<BoxClass>
}


@pre<UserClass>('save', async function () {
    this.password = await util.HashPass(this.password);
})
@modelOptions({ schemaOptions: { collection: 'users' } })
export class UserClass {
    @prop({ required: true, unique: true })
    public email!: string;
    @prop({ required: true })
    public password!: string;
    @prop({ enum: Roles, default: Roles.USER })
    public role?: Roles;

    @prop({ type: UserBoxesClass, _id: false, default: [] })
    public boxes?: UserBoxesClass[]

    public async isValidPassword(this: DocumentType<UserClass>, pass: string): Promise<boolean> {
        return await util.ValidatePass(pass, this.password);
    }
    public async addBox(this: DocumentType<UserClass>, box: UserBoxesClass): Promise<DocumentType<UserClass>> {

        this.boxes!.push(box);
        console.log(this.boxes);

        return await this.save()
    }
    public async removeBox(this: DocumentType<UserClass>, boxID: string): Promise<DocumentType<UserClass>> {
        return await this.updateOne({ $pull: { "boxes.box": boxID } }).exec();
    }
    public getBox(this: DocumentType<UserClass>, id: string) {
        let box = this.boxes!.find(userBox => {
            if (isRefType(userBox.box)) {
                return userBox.box.toHexString() === id;
            }
        }) || null;
        return box;
    }
}

export const userModel = getModelForClass(UserClass);

