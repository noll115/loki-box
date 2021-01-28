import { DocumentType, getModelForClass, ModelOptions, pre, prop } from "@typegoose/typegoose";
import * as socketio from "socket.io";
import * as util from "../util";
import { MessageClass } from "./message";


@pre<BoxClass>('save', async function () {
    this.secretToken = await util.HashSecret(this.secretToken);
})
@ModelOptions({ schemaOptions: { collection: 'boxes' } })
export class BoxClass {
    @prop()
    public secretToken!: string;

    public async isSecretToken(this: DocumentType<BoxClass>, secret: string) {
        return await util.ValidateSecret(secret, this.secretToken);
    }

}

export const boxModel = getModelForClass(BoxClass);