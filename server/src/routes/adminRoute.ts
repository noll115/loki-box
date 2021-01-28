import { Router } from "express";
import { PassportStatic } from "passport";
import { IVerifyOptions } from "passport-local";
import { boxModel, Roles } from "../lib/mongoDB";
import { HttpException } from "../types/general";

export default (passport: PassportStatic) => {
    let router = Router();

    router.use((req, res, next) => {
        passport.authenticate('user-jwt', { session: false }, (err, user, opt: IVerifyOptions) => {
            if (err) return next(err);
            if (opt) return next(new HttpException(422, opt.message));
            req.currentUser = user;

            next();
        })(req, res, next)
    })


    router.use((req, res, next) => {
        let user = req.currentUser;
        if (user.role! !== Roles.ADMIN) {
            return next(new HttpException(401, "Unauthorized"));
        }
        next();
    });

    router.post("/createBox", async (req, res) => {
        let { secret } = req.body;
        let box = await boxModel.create({ secretToken: secret })
        res.send(box._id);
    });
    return router;
}