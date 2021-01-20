"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
require("./lib/mongoDB");
var box_1 = __importDefault(require("./routes/box"));
var passport_1 = __importDefault(require("./lib/passport"));
var user_1 = __importDefault(require("./routes/user"));
var socket_io_1 = require("socket.io");
var app = express_1.default();
var server = require('http').createServer(app);
server.listen(process.env.PORT, function () {
    console.log("Listening on " + process.env.PORT);
});
var io = new socket_io_1.Server(server, { serveClient: false });
var userNsp = io.of("/user");
var boxNsp = io.of("/box");
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
app.use("/user", user_1.default(passport_1.default, userNsp, boxNsp));
app.use("/box", box_1.default(passport_1.default, boxNsp, userNsp));
var ErrorHandler = function (err, req, res, next) {
    console.log(err);
    var status = err.status || 500;
    var msg = err.message || "Something went wrong!";
    res.status(status).send(msg);
};
app.use(ErrorHandler);
