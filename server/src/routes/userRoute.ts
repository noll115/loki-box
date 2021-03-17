import { Router } from "express";
import { IVerifyOptions } from "passport-local";
import { UserBoxesClass, boxModel, userModel } from "../lib/mongoDB";
import { HttpException, INewBox, JWTUserData, NameSpaces, SocketsOnline, UserSocket } from "../types/general";
import * as jwt from "jsonwebtoken";
import adminRoute from "./adminRoute";
import { SocketVerifyUserJWT } from "../lib/passport";
import messageModel, { Message } from "../lib/mongoDB/message";
import { PassportStatic } from "passport";

export default (passport: PassportStatic, sockets: SocketsOnline, namespaces: NameSpaces) => {
    let router = Router();

    router.post("/register", async (req, res, next) => {
        let { pass, email } = req.body;
        try {
            let user = await userModel.create({ email, password: pass });
            let userData: JWTUserData = { user: { id: user._id, role: user.role! } };
            const jwtToken = jwt.sign(userData, process.env.USER_SECRET!);
            res.send({ jwtToken });
        } catch (error) {
            next(error)
        }
    });


    router.post("/login", (req, res, next) => {
        console.log(req.body);

        passport.authenticate("login", { session: false }, (err, user, opt: IVerifyOptions) => {

            if (err) return next(err);
            if (opt) return next(new HttpException(422, opt.message));
            req.currentUser = user;

            next();

        })(req, res, next);
    }, (req, res) => {
        let user = req.currentUser;
        let userData: JWTUserData = { user: { id: user._id, role: user.role! } };
        const jwtToken = jwt.sign(userData, process.env.USER_SECRET!);

        return res.send({ jwtToken });
    });
    namespaces.user.use(SocketVerifyUserJWT);


    namespaces.user.on('connection', async (socket: UserSocket) => {
        sockets[socket.user.id] = socket.id;
        console.log(socket.user.id);
        
        socket.emit('boxes', socket.user.boxes)

        socket.on("getBoxes", async (cb) => {
            let boxes = socket.user.boxes!;
            console.log(boxes);

            cb(boxes)
        })
        socket.on('disconnect', () => {
            console.log(`${socket.user.email} disconnected`);
        })

        socket.on("registerBox", async (newBoxInfo: INewBox, cb: CallableFunction) => {
            console.log(newBoxInfo);

            try {
                let box = await boxModel.findById(newBoxInfo.boxID);

                if (box) {
                    const newBox: UserBoxesClass = {
                        box: box.id,
                        boxName: newBoxInfo.boxName,
                        seenAs: newBoxInfo.seenAs
                    }
                    socket.user = await socket.user.addBox(newBox);
                    console.log(socket.user.id);
                    socket.emit('boxes', socket.user.boxes)
                    cb({ status: "ok" });
                } else {
                    cb({ status: "failed" });
                }
            } catch (error) {
                console.log(error);

                cb({ status: "failed" });
            }
        });

        socket.on("sendMsg", async (boxID: string, msg: Message, cb: Function) => {
            let box = socket.user.getBox(boxID);


            try {
                if (box) {
                    let boxSocket = sockets[boxID] || null;
                    const newMsg = await messageModel.create({
                        data: msg,
                        from: socket.user.id,
                        to: boxID,
                        fromSeenAs: box.seenAs
                    });
                    if (boxSocket) {
                        let socketInstance = namespaces.box.sockets.get(boxSocket);
                        if (socketInstance) {
                            socketInstance.emit('gotNewMsg', newMsg._id);
                        }
                    }
                    cb({ status: 'ok' })
                }
                cb({ status: "failed" })
            } catch (error) {
                console.log(error);

                cb({ status: "failed" })

            }
        });
        socket.on("removeBox", async (boxID: string, cb: Function) => {
            try {
                socket.user = await socket.user.removeBox(boxID);
                cb({ status: "ok" })
            } catch (err) {
                cb({ status: "failed" })
            }

        })
        socket.on('getMsgHistory', async (boxID: string, cb: Function) => {
            let box = socket.user.getBox(boxID);
            if (box) {
                let msgs = await messageModel.find({ from: socket.user.id }).select('-__v -from').sort('-sentTime').lean();
                cb({ status: 'ok', msgs });
            }
            cb({ status: 'failed' })
        });

    })
    router.use("/admin", adminRoute(passport));



    return router;
}