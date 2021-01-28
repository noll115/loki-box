import { DocumentType, getModelForClass, ModelOptions, prop, Ref, ReturnModelType } from "@typegoose/typegoose";
import { UserClass } from "./user";
import { BoxClass } from './box'
@ModelOptions({ schemaOptions: { collection: 'messages' } })
export class MessageClass {
    @prop({ required: true, default: Date.now() })
    public sentTime?: Date;

    @prop({ default: false })
    public seen?: boolean;

    @prop({ required: true })
    public data!: Buffer;

    @prop({ ref: () => BoxClass, required: true, index: true })
    public to: Ref<BoxClass>

    @prop({ ref: () => UserClass, required: true, index: true })
    public from: Ref<UserClass>

}

const messageModel = getModelForClass(MessageClass);

export default messageModel;