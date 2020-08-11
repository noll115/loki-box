import { Router } from "express";
import { PassportStatic } from "passport";
let router = Router();


export default (passport: PassportStatic) => {

    router.post("/", (req, res) => {

    })

    return router;
}



