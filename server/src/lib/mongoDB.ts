import { connect, connection } from "mongoose";
import { getModelForClass, prop, Ref, modelOptions, index, pre, DocumentType } from "@typegoose/typegoose";
import * as util from "./util";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";

if (process.env.DB) {
    connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "loki-box"
    });

    connection.on('connected', function () {
        console.log('Mongoose default connection open to ' + process.env.DB);
    });

    connection.on('error', function (err) {
        console.log('Mongoose default connection error: ' + err);
    });

    connection.on('disconnected', function () {
        console.log('Mongoose default connection disconnected');
    });

    process.on('SIGINT', function () {
        connection.close(function () {
            console.log('Mongoose default connection disconnected through app termination');
            process.exit(0);
        });
    });
}





@modelOptions({ schemaOptions: { collection: "boxes" } })
class BoxClass extends Base {
    @prop({ required: true })
    public socket!: number;
}


@pre<UserClass>("save", async function () {
    this.password = await util.HashPass(this.password);
})
@index({ email: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: "users" } })
class UserClass extends Base {
    @prop({ required: true })
    public email!: string;

    @prop({ required: true })
    public password!: string;

    @prop({ ref: BoxClass, type: { name: String, box: BoxClass }, default: [] })
    public boxes?: { name: string, box: Ref<BoxClass> }[];

    public async ValidPassword(this: DocumentType<UserClass>, pass: string) {
        return util.ValidatePass(pass, this.password);
    }
}

export { UserClass, BoxClass }


export const User = getModelForClass(UserClass);
export const Box = getModelForClass(BoxClass);

