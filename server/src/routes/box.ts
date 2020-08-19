import { Router } from "express";
import { PassportStatic } from "passport";
let router = Router();


export default (passport: PassportStatic) => {

    router.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
        console.log("hello");
        res.send(req.user)
    })

    return router;
}



