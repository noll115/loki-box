"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
require("./lib/mongoDB");
var boxRoute_1 = __importDefault(require("./routes/boxRoute"));
var passport_1 = __importDefault(require("./lib/passport"));
var userRoute_1 = __importDefault(require("./routes/userRoute"));
var socket_io_1 = require("socket.io");
var redis_1 = require("./lib/redis");
var app = express_1.default();
var server = require('http').createServer(app);
server.listen(process.env.PORT, function () {
    console.log("Listening on " + process.env.PORT);
});
var io = new socket_io_1.Server(server, { serveClient: false });
var _a = redis_1.createRedisAdapter(), adapter = _a.adapter, redisClient = _a.redisClient;
var redisSocket = new redis_1.RedisSocket(redisClient);
io.adapter(adapter);
var nameSpaces = { user: io.of("/user"), box: io.of("/box") };
app.get("/", function (req, res) {
    res.send('test');
});
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
app.use("/user", userRoute_1.default(passport_1.default, redisSocket, nameSpaces));
app.use("/box", boxRoute_1.default(passport_1.default, redisSocket, nameSpaces));
var ErrorHandler = function (err, req, res, next) {
    console.log(err);
    var status = err.status || 500;
    var msg = err.message || "Something went wrong!";
    res.status(status).send(msg);
};
app.use(ErrorHandler);
