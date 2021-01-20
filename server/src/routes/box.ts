import { Router } from "express";
import { PassportStatic } from "passport";
import { Box } from "../lib/mongoDB";
import * as jwt from "jsonwebtoken";
import { BoxSocket, HttpException, JWTBoxData } from "../types/general";
import * as socketio from "socket.io"
import { SocketVerifyBoxJWT } from "../lib/passport";


export default (passport: PassportStatic, boxNsp: socketio.Namespace, userNsp: socketio.Namespace,) => {
    let router = Router();

    router.get("/auth", async (req, res, next) => {
        let secretToken: string = req.query.token as string;
        let boxId: string = req.query.boxId as string;
        let box = await Box.findById(boxId);
        if (box) {
            let verified = await box.IsSecretToken(secretToken);
            if (verified) {
                let boxData: JWTBoxData = { user: { id: box._id } };
                let token = jwt.sign(boxData, process.env.BOX_SECRET!);
                return res.send({ token });
            }
        }
        next(new HttpException(400, "Unauthorized"));
    });

    boxNsp.use(SocketVerifyBoxJWT)


    return router;
}



