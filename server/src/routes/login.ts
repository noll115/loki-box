import { Router } from "express";
import { PassportStatic } from "passport";
import * as jwt from "jsonwebtoken";
import { UserClass } from "../lib/mongoDB";
let router = Router();





export default (passport: PassportStatic) => {

    router.post("/login", passport.authenticate("login", { session: false }), (req, res) => {
        let user = req.user as UserClass;
        const body = { id: user._id };
        const token = jwt.sign({ user: body }, process.env.secret!);
        return res.send({ token });
    });

    return router;
} 