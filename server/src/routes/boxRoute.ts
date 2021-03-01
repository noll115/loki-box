import { Router } from "express";
import { boxModel } from "../lib/mongoDB";
import * as jwt from "jsonwebtoken";
import { BoxSocket, HttpException, JWTBoxData, NameSpaces, SocketsOnline } from "../types/general";
import { SocketVerifyBoxJWT } from "../lib/passport";
import { PassportStatic } from "passport";
import messageModel from "../lib/mongoDB/message";


export default (passport: PassportStatic, sockets: SocketsOnline, namespaces: NameSpaces) => {
    let router = Router();
    router.post("/auth", async (req, res, next) => {
        let secretToken: string = req.body["token"];
        let boxId: string = req.body["boxID"];

        let box = await boxModel.findById(boxId);
        if (box) {
            let verified = await box.isSecretToken(secretToken);
            if (verified) {
                let boxData: JWTBoxData = { user: { id: box._id } };
                let token = jwt.sign(boxData, process.env.BOX_SECRET!);

                return res.send({ token });
            }
        }
        next(new HttpException(400, "Unauthorized"));
    });
    namespaces.box.use(SocketVerifyBoxJWT);

    namespaces.box.on('connection', async (socket: BoxSocket) => {
        sockets[socket.box.id] = socket.id;
        let msg = await messageModel.find({ to: socket.box.id, seen: false }).populate('from').sort('-sentTime').select('-seen -to -sentTime -__v').limit(1).lean();
        socket.emit('getNewMsg', msg[0]);
        socket.on('seenMsg', async (msgID: string) => {
            messageModel.findByIdAndUpdate(msgID, { seen: true }).exec();
        });
        socket.on('getNewMsg', async (cb) => {
            console.log("GET NEW MSG");
            let msg = await messageModel.find({ to: socket.box.id, seen: false }).sort('-sentTime').select('-seen -to -sentTime -__v').limit(1).lean();
            cb(msg[0]);
        });
        socket.on('getMsg', async (id, cb) => {
            console.log('getMsg');
            let msg = await messageModel.findById(id).select('-seen -to -sentTime -__v').lean();
            cb(msg);
        })
    });



    return router;
}
