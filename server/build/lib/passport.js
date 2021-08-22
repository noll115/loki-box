"use strict";
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
exports.SocketVerifyBoxJWT = exports.SocketVerifyUserJWT = void 0;
var passport_jwt_1 = require("passport-jwt");
var passport_local_1 = require("passport-local");
var mongoDB_1 = require("./mongoDB");
var passport_1 = __importDefault(require("passport"));
var userOptions = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.USER_SECRET,
    ignoreExpiration: true,
    algorithms: ["HS256"]
};
var boxOptions = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.BOX_SECRET,
    ignoreExpiration: true,
    algorithms: ["HS256"]
};
passport_1.default.use("box-jwt", new passport_jwt_1.Strategy(boxOptions, function (token, done) { return __awaiter(void 0, void 0, void 0, function () {
    var box, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, mongoDB_1.boxModel.findById(token.user.id)];
            case 1:
                box = _a.sent();
                if (box) {
                    return [2 /*return*/, done(null, box)];
                }
                done(null, false, { message: "Not found" });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                done(err_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
passport_1.default.use("user-jwt", new passport_jwt_1.Strategy(userOptions, function (token, done) { return __awaiter(void 0, void 0, void 0, function () {
    var user, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, mongoDB_1.userModel.findById(token.user.id)];
            case 1:
                user = _a.sent();
                if (user) {
                    return [2 /*return*/, done(null, user)];
                }
                done(null, false, { message: "Not found" });
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                done(err_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
passport_1.default.use("login", new passport_local_1.Strategy({
    passwordField: "pass",
    usernameField: "email"
}, function (email, password, done) { return __awaiter(void 0, void 0, void 0, function () {
    var user, valid, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, mongoDB_1.userModel.findOne({ email: email })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, done(null, false, { message: "User not found" })];
                }
                return [4 /*yield*/, user.isValidPassword(password)];
            case 2:
                valid = _a.sent();
                if (!valid) {
                    return [2 /*return*/, done(null, false, { message: "Wrong password" })];
                }
                return [2 /*return*/, done(null, user)];
            case 3:
                err_3 = _a.sent();
                return [2 /*return*/, done(err_3)];
            case 4: return [2 /*return*/];
        }
    });
}); }));
function SocketVerifyUserJWT(socket, next) {
    var userSocket = socket;
    console.log('user');
    passport_1.default.authenticate('user-jwt', { session: false }, function (err, user, info) {
        if (!user || err)
            return userSocket.emit('jwt_failed');
        userSocket.user = user;
        next();
    })(userSocket.request, {}, next);
}
exports.SocketVerifyUserJWT = SocketVerifyUserJWT;
function SocketVerifyBoxJWT(socket, next) {
    var boxSocket = socket;
    passport_1.default.authenticate('box-jwt', { session: false }, function (err, box, info) {
        if (!box || err)
            return boxSocket.emit('jwt_failed');
        boxSocket.box = box;
        next();
    })(boxSocket.request, {}, next);
}
exports.SocketVerifyBoxJWT = SocketVerifyBoxJWT;
exports.default = passport_1.default;
