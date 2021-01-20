import { Router } from "express";
import { PassportStatic } from "passport";
import { Box, IUserDoc, Roles } from "../lib/mongoDB";
import { HttpException } from "../types/general";

export default (passport: PassportStatic) => {
    let router = Router();
    router.use((req, res, next) => {
        let user = req.user as IUserDoc
        if (user.role! !== Roles.ADMIN) {
            return next(new HttpException(401, "Unauthorized"));
        }
        next();
    });

    router.post("/createBox", async (req, res) => {
        let { secret } = req.body;
        let box = await Box.create({ secretToken: secret, socketID: "" })
        res.send(box._id);
    });
    return router;
}