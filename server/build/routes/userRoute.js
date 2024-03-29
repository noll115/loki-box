"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mongoDB_1 = require("../lib/mongoDB");
var general_1 = require("../types/general");
var jwt = __importStar(require("jsonwebtoken"));
var adminRoute_1 = __importDefault(require("./adminRoute"));
var passport_1 = require("../lib/passport");
var message_1 = __importDefault(require("../lib/mongoDB/message"));
exports.default = (function (passport, sockets, namespaces) {
    var router = express_1.Router();
    router.post("/register", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, pass, email, user, userData, jwtToken, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, pass = _a.pass, email = _a.email;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mongoDB_1.userModel.create({ email: email, password: pass })];
                case 2:
                    user = _b.sent();
                    userData = { user: { id: user._id, role: user.role } };
                    jwtToken = jwt.sign(userData, process.env.USER_SECRET);
                    res.send({ jwtToken: jwtToken });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    next(error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    router.post("/login", function (req, res, next) {
        console.log(req.body);
        passport.authenticate("login", { session: false }, function (err, user, opt) {
            if (err)
                return next(err);
            if (opt)
                return next(new general_1.HttpException(401, opt.message));
            req.currentUser = user;
            next();
        })(req, res, next);
    }, function (req, res) {
        var user = req.currentUser;
        var userData = { user: { id: user._id, role: user.role } };
        var jwtToken = jwt.sign(userData, process.env.USER_SECRET);
        return res.send({ jwtToken: jwtToken });
    });
    namespaces.user.use(passport_1.SocketVerifyUserJWT);
    namespaces.user.on('connection', function (socket) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            sockets[socket.user.id] = socket.id;
            console.log(socket.user.id);
            socket.emit('boxes', socket.user.boxes);
            socket.on("getBoxes", function (cb) { return __awaiter(void 0, void 0, void 0, function () {
                var boxes;
                return __generator(this, function (_a) {
                    boxes = socket.user.boxes;
                    console.log(boxes);
                    cb(boxes);
                    return [2 /*return*/];
                });
            }); });
            socket.on('disconnect', function () {
                console.log(socket.user.email + " disconnected");
            });
            socket.on("registerBox", function (newBoxInfo, cb) { return __awaiter(void 0, void 0, void 0, function () {
                var box, newBox, _a, error_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            console.log(newBoxInfo);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 6, , 7]);
                            return [4 /*yield*/, mongoDB_1.boxModel.findById(newBoxInfo.boxID)];
                        case 2:
                            box = _b.sent();
                            if (!box) return [3 /*break*/, 4];
                            newBox = {
                                box: box.id,
                                boxName: newBoxInfo.boxName,
                                seenAs: newBoxInfo.seenAs
                            };
                            _a = socket;
                            return [4 /*yield*/, socket.user.addBox(newBox)];
                        case 3:
                            _a.user = _b.sent();
                            console.log(socket.user.id);
                            socket.emit('boxes', socket.user.boxes);
                            cb({ status: "ok" });
                            return [3 /*break*/, 5];
                        case 4:
                            cb({ status: "failed" });
                            _b.label = 5;
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            error_2 = _b.sent();
                            console.log(error_2);
                            cb({ status: "failed" });
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            socket.on("sendMsg", function (boxID, msg, cb) { return __awaiter(void 0, void 0, void 0, function () {
                var box, boxSocket, newMsg, socketInstance, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            box = socket.user.getBox(boxID);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            if (!box) return [3 /*break*/, 3];
                            boxSocket = sockets[boxID] || null;
                            return [4 /*yield*/, message_1.default.create({
                                    data: msg,
                                    from: socket.user.id,
                                    to: boxID,
                                    fromSeenAs: box.seenAs
                                })];
                        case 2:
                            newMsg = _a.sent();
                            if (boxSocket) {
                                socketInstance = namespaces.box.sockets.get(boxSocket);
                                if (socketInstance) {
                                    socketInstance.emit('gotNewMsg', newMsg._id);
                                }
                            }
                            cb({ status: 'ok' });
                            _a.label = 3;
                        case 3:
                            cb({ status: "failed" });
                            return [3 /*break*/, 5];
                        case 4:
                            error_3 = _a.sent();
                            console.log(error_3);
                            cb({ status: "failed" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            socket.on("removeBox", function (boxID, cb) { return __awaiter(void 0, void 0, void 0, function () {
                var _a, err_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            _a = socket;
                            return [4 /*yield*/, socket.user.removeBox(boxID)];
                        case 1:
                            _a.user = _b.sent();
                            cb({ status: "ok" });
                            return [3 /*break*/, 3];
                        case 2:
                            err_1 = _b.sent();
                            cb({ status: "failed" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            socket.on('getMsgHistory', function (boxID, cb) { return __awaiter(void 0, void 0, void 0, function () {
                var box, msgs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            box = socket.user.getBox(boxID);
                            if (!box) return [3 /*break*/, 2];
                            return [4 /*yield*/, message_1.default.find({ from: socket.user.id }).select('-__v -from').sort('-sentTime').lean()];
                        case 1:
                            msgs = _a.sent();
                            cb({ status: 'ok', msgs: msgs });
                            _a.label = 2;
                        case 2:
                            cb({ status: 'failed' });
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    router.use("/admin", adminRoute_1.default(passport));
    return router;
});
