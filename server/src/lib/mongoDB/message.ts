import { DocumentType, getModelForClass, ModelOptions, prop, Ref, ReturnModelType } from "@typegoose/typegoose";
import { UserClass } from "./user";
import { BoxClass } from './box'



export class Line {
    @prop({ required: true })
    public color!: string
    @prop({ type: Number, required: true })
    public points!: number[]
    @prop({ required: true })
    public lineWidth!: number
}

export class TextData {
    @prop({ required: true })
    public text!: string
    @prop({ required: true })
    public txtSize!: number
    @prop({ type: Number, required: true })
    public pos!: number[]
    @prop({ required: true })
    public color!: string
}

export class Message {
    @prop({ type: Line, _id: false, required: true })
    public lines!: Line[]
    @prop({ type: TextData, _id: false, required: true })
    public texts!: TextData[]
}


@ModelOptions({ schemaOptions: { collection: 'messages' } })
export class MessageClass {
    @prop({ default: Date.now })
    public sentTime?: Date;

    @prop({ default: false })
    public seen?: boolean;

    @prop({ _id: false, required: true })
    public data!: Message;

    @prop({ ref: () => BoxClass, required: true, index: true })
    public to: Ref<BoxClass>

    @prop({ ref: () => UserClass, required: true, index: true })
    public from: Ref<UserClass>

    @prop({ required: true })
    public fromSeenAs!: string

}

export const messageModel = getModelForClass(MessageClass);
