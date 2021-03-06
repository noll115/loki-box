import express, { ErrorRequestHandler } from "express";
import "./lib/mongoDB";
import boxRoute from "./routes/boxRoute";
import passport from "./lib/passport";
import userRoute from "./routes/userRoute";
import { HttpException, NameSpaces, SocketsOnline } from "./types/general";
import { Server } from 'socket.io'


const app = express();
const server = require('http').createServer(app);
server.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`);
})
let io = new Server(server, { serveClient: false });

const sockets: SocketsOnline = {}

let nameSpaces: NameSpaces = { user: io.of("/user"), box: io.of("/box") }

app.get("/", (req, res) => {
    res.send('test')
})
app.use(express.json())
app.use(passport.initialize())

app.use("/user", userRoute(passport, sockets, nameSpaces));
app.use("/box", boxRoute(passport, sockets, nameSpaces));


let ErrorHandler: ErrorRequestHandler = (err: HttpException, req, res, next) => {
    console.log(err);
    let status = err.status || 500;
    let msg = err.message || "Something went wrong!";
    res.status(status).send(msg);
}


app.use(ErrorHandler)

