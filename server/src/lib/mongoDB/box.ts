import mongoose, { Document, Model, Schema } from "mongoose";
import * as socketio from "socket.io";
import * as util from "../util";


export interface IBoxDoc extends Document {
    secretToken: string,
    socketID: string,
    isOnline(): boolean,
    IsSecretToken(secret: string): Promise<boolean>,
    SendMsg(msg: String, boxNsp: socketio.Namespace): { status: string }
}

const BoxSchema = new Schema<IBoxDoc>({
    secretToken: { type: String, required: true },
    socketId: String
});

BoxSchema.method({
    async IsSecretToken(this: IBoxDoc, secret: string) {
        return await util.ValidateSecret(secret, this.secretToken);
    },
    SendMsg(this: IBoxDoc, msg: string, boxNsp: socketio.Namespace) {
        if (this.isOnline()) {
            boxNsp.to(this.socketID).emit("recieveMsg", msg, ({ status }: { status: string }) => {
                if (status === "ok") {
                    return { status: "ok" };
                }
                return { status: "failed" };
            });
        }
        return { status: "box offline" };
    },
    isOnline(this: IBoxDoc) {
        return this.socketID !== "";
    }
})


BoxSchema.pre("save", async function (this: IBoxDoc, next) {
    this.secretToken = await util.HashSecret(this.secretToken);
    next();
});


export const Box = mongoose.model<IBoxDoc>("boxes", BoxSchema);