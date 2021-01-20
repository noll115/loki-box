import { Router } from "express";
import { PassportStatic } from "passport";
import { IVerifyOptions } from "passport-local";
import { Box, IUserBoxDoc, IUserDoc, User } from "../lib/mongoDB";
import { HttpException, JWTUserData, UserSocket } from "../types/general";
import * as jwt from "jsonwebtoken";
import adminRoute from "./admin";
import * as socketio from "socket.io"
import { SocketVerifyUserJWT } from "../lib/passport";

export default (passport: PassportStatic, userNsp: socketio.Namespace, boxNsp: socketio.Namespace) => {
    let router = Router();

    router.post("/register", async (req, res, next) => {
        let { pass, email } = req.body;
        let user = await User.create({ email, password: pass });
        let userData: JWTUserData = { user: { id: user._id, role: user.role! } };
        const jwtToken = jwt.sign(userData, process.env.USER_SECRET!);
        res.send({ jwtToken });
    });


    router.post("/login", (req, res, next) => {
        console.log(req.body);

        passport.authenticate("login", { session: false }, (err, user, opt: IVerifyOptions) => {

            if (err) return next(err);
            if (opt) return next(new HttpException(422, opt.message));
            req.user = user;
            next();

        })(req, res, next);
    }, (req, res) => {
        let user = req.user as IUserDoc;
        let userData: JWTUserData = { user: { id: user._id, role: user.role! } };
        const jwtToken = jwt.sign(userData, process.env.USER_SECRET!);

        return res.send({ jwtToken });
    });

    userNsp.use(SocketVerifyUserJWT);


    userNsp.on('connection', async (socket: UserSocket) => {

        socket.on("getBoxes", async (cb) => {
            let boxes = socket.user.boxes! as IUserBoxDoc[];
            console.log(boxes);
            
            cb(boxes)
        })

        socket.on("registerBox", async ({ boxID, boxName, seenAs }: { boxID: string, boxName: string, seenAs: string }, cb: CallableFunction) => {
            let box = await Box.findById(boxID);
            if (box) {
                socket.user = await socket.user.AddBox({ box: box._id, boxName, seenAs });
                console.log(socket.user);

                cb({ status: "ok" });
            } else {
                cb({ status: "failed" });
            }
        });

        socket.on("sendMsg", async (boxID: string, msg: string, cb: Function) => {
            let boxes = socket.user.boxes! as IUserBoxDoc[];
            let hasBox = boxes.findIndex((val) => {
                return val.box.toHexString() === boxID;
            });
            if (hasBox !== -1) {
                let box = await Box.findById(boxID);
                if (box) {
                    let status = box.SendMsg(msg, boxNsp);
                    return cb(status);
                }
            }
            cb({ status: "box not found" })
        });
        socket.on("removeBox", async (boxID: string, cb: Function) => {
            try {
                socket.user = await socket.user.RemoveBox(boxID);
                cb({ status: "ok" })
            } catch (err) {
                cb({ status: "failed" })
            }

        })

    })
    router.use("/admin", adminRoute(passport));





    return router;
}