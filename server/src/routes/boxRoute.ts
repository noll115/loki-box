import { Router } from "express";
import { boxModel } from "../lib/mongoDB";
import * as jwt from "jsonwebtoken";
import { BoxSocket, HttpException, JWTBoxData, NameSpaces } from "../types/general";
import { SocketVerifyBoxJWT } from "../lib/passport";
import { PassportStatic } from "passport";
import { RedisSocket } from "../lib/redis";
import messageModel from "../lib/mongoDB/message";


export default (passport: PassportStatic, redis: RedisSocket, namespaces: NameSpaces) => {
    let router = Router();
    router.use((req, res, next) => {
        console.log(req.headers);
        console.log(req.body);

        next();
    })
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
        await redis.addSocket(socket.box, socket.id);

        let msgs = await messageModel.find({ to: socket.box.id }).sort('-sentTime').select('-seen -to -sentTime -__v').limit(1).lean();
        socket.emit('getMsg', msgs);
        socket.on('seenMsg', (msgID: string) => {
            messageModel.findByIdAndUpdate(msgID, { seen: true })
        });
    });



    return router;
}
