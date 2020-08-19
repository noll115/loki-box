import { Router } from "express";
import { PassportStatic } from "passport";
import * as jwt from "jsonwebtoken";
import { UserClass } from "../lib/mongoDB";
import { IVerifyOptions } from "passport-local";
let router = Router();





export default (passport: PassportStatic) => {

    router.post("/login", (req, res, next) => {
        passport.authenticate("login", { session: false }, (err, user, opt: IVerifyOptions) => {
            if (err) return next(err);
            if (opt) return res.send({ errMsg: opt.message });
            req.user = user;
            next();

        })(req, res, next);
    }, (req, res) => {
        let user = req.user as UserClass;
        const body = { id: user._id };
        const token = jwt.sign({ user: body }, process.env.SECRET!);
        console.log(body);

        return res.send({ token });
    });

    router.post("/register", (req, res, next) => {
        passport.authenticate("register", { session: false }, (err, user, opt) => {
            if (err) {
                if (err.code === 11000) {
                    return res.send({
                        errMsg: "Email already exists"
                    });
                }
                return next(err);
            }
            req.user = user;
            return next()
        })(req, res, next)
    }, (req, res) => {
        console.log(req.user);
        res.send(req.user);
    });

    return router;
} 