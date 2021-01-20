import express, { ErrorRequestHandler } from "express";
import "./lib/mongoDB";
import boxRoute from "./routes/box";
import passport from "./lib/passport";
import userRoute from "./routes/user";
import { HttpException } from "./types/general";
import { Server } from 'socket.io'


const app = express();
const server = require('http').createServer(app);
server.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`);
})
let io = new Server(server, { serveClient: false });
let userNsp = io.of("/user");
let boxNsp = io.of("/box");

app.use(express.json())
app.use(passport.initialize())

app.use("/user", userRoute(passport, userNsp, boxNsp));
app.use("/box", boxRoute(passport, boxNsp, userNsp));


let ErrorHandler: ErrorRequestHandler = (err: HttpException, req, res, next) => {
    console.log(err);
    let status = err.status || 500;
    let msg = err.message || "Something went wrong!";
    res.status(status).send(msg);
}


app.use(ErrorHandler)

