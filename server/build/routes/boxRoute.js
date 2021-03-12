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
var jwt = __importStar(require("jsonwebtoken"));
var general_1 = require("../types/general");
var passport_1 = require("../lib/passport");
var message_1 = __importDefault(require("../lib/mongoDB/message"));
function getNewMsg(id) {
    return __awaiter(this, void 0, void 0, function () {
        var resp, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, message_1.default.find({ to: id, seen: false }, '-seen -to -sentTime -__v').sort('-sentTime').limit(1).lean()];
                case 1:
                    resp = _a.sent();
                    msg = resp[0] || null;
                    console.log(msg);
                    return [2 /*return*/, msg];
            }
        });
    });
}
exports.default = (function (passport, sockets, namespaces) {
    var router = express_1.Router();
    router.post("/auth", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var secretToken, boxId, box, verified, boxData, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    secretToken = req.body["token"];
                    boxId = req.body["boxID"];
                    return [4 /*yield*/, mongoDB_1.boxModel.findById(boxId)];
                case 1:
                    box = _a.sent();
                    if (!box) return [3 /*break*/, 3];
                    return [4 /*yield*/, box.isSecretToken(secretToken)];
                case 2:
                    verified = _a.sent();
                    if (verified) {
                        boxData = { user: { id: box._id } };
                        token = jwt.sign(boxData, process.env.BOX_SECRET);
                        return [2 /*return*/, res.send({ token: token })];
                    }
                    _a.label = 3;
                case 3:
                    next(new general_1.HttpException(400, "Unauthorized"));
                    return [2 /*return*/];
            }
        });
    }); });
    namespaces.box.use(passport_1.SocketVerifyBoxJWT);
    namespaces.box.on('connection', function (socket) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            sockets[socket.box.id] = socket.id;
            socket.on('seenMsg', function (msgID) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    message_1.default.findByIdAndUpdate(msgID, { seen: true }).exec();
                    return [2 /*return*/];
                });
            }); });
            socket.on('getMsg', function (id, cb) { return __awaiter(void 0, void 0, void 0, function () {
                var msg;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log('getMsg');
                            return [4 /*yield*/, message_1.default.findById(id, '-from -_id -seen -to -sentTime -__v').lean()];
                        case 1:
                            msg = _a.sent();
                            console.log(msg);
                            cb(msg);
                            return [2 /*return*/];
                    }
                });
            }); });
            socket.on('checkForMsg', function (cb) { return __awaiter(void 0, void 0, void 0, function () {
                var resp, msg;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, message_1.default.find({ to: socket.box.id, seen: false }, '_id').sort('-sentTime').limit(1).lean()];
                        case 1:
                            resp = _a.sent();
                            msg = resp[0] || null;
                            console.log(msg);
                            cb(msg);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    return router;
});
