import { DocumentType, getModelForClass, ModelOptions, prop, Ref, ReturnModelType } from "@typegoose/typegoose";
import { UserClass } from "./user";
import { BoxClass } from './box'



class Point {
    @prop({ required: true })
    public x!: number
    @prop({ required: true })
    public y!: number
}

export class Line {
    @prop({ required: true })
    public color!: string
    @prop({ type: Point, _id: false, required: true })
    public points!: Point[]
    @prop({ required: true })
    public lineWidth!: number
}

export class TextData {
    @prop({ required: true })
    public text!: string
    @prop({ required: true })
    public fontSize!: number
    @prop({ _id: false, required: true })
    public pos!: Point
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

}

const messageModel = getModelForClass(MessageClass);

export default messageModel;