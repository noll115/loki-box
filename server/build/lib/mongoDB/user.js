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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.UserClass = exports.UserBoxesClass = exports.Roles = void 0;
var box_1 = require("./box");
var util = __importStar(require("../util"));
var typegoose_1 = require("@typegoose/typegoose");
var Roles;
(function (Roles) {
    Roles[Roles["USER"] = 0] = "USER";
    Roles[Roles["ADMIN"] = 1] = "ADMIN";
})(Roles = exports.Roles || (exports.Roles = {}));
var UserBoxesClass = /** @class */ (function () {
    function UserBoxesClass() {
    }
    __decorate([
        typegoose_1.prop(),
        __metadata("design:type", String)
    ], UserBoxesClass.prototype, "boxName", void 0);
    __decorate([
        typegoose_1.prop(),
        __metadata("design:type", String)
    ], UserBoxesClass.prototype, "seenAs", void 0);
    __decorate([
        typegoose_1.prop({ ref: function () { return box_1.BoxClass; } }),
        __metadata("design:type", Object)
    ], UserBoxesClass.prototype, "box", void 0);
    return UserBoxesClass;
}());
exports.UserBoxesClass = UserBoxesClass;
var UserClass = /** @class */ (function () {
    function UserClass() {
    }
    UserClass.prototype.isValidPassword = function (pass) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util.ValidatePass(pass, this.password)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UserClass.prototype.addBox = function (box) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.boxes.push(box);
                        console.log(this.boxes);
                        return [4 /*yield*/, this.save()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UserClass.prototype.removeBox = function (boxID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateOne({ $pull: { "boxes.box": boxID } }).exec()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UserClass.prototype.getBox = function (id) {
        var box = this.boxes.find(function (userBox) {
            if (typegoose_1.isRefType(userBox.box)) {
                return userBox.box.toHexString() === id;
            }
        }) || null;
        return box;
    };
    __decorate([
        typegoose_1.prop({ required: true, unique: true }),
        __metadata("design:type", String)
    ], UserClass.prototype, "email", void 0);
    __decorate([
        typegoose_1.prop({ required: true }),
        __metadata("design:type", String)
    ], UserClass.prototype, "password", void 0);
    __decorate([
        typegoose_1.prop({ enum: Roles, default: Roles.USER }),
        __metadata("design:type", Number)
    ], UserClass.prototype, "role", void 0);
    __decorate([
        typegoose_1.prop({ type: UserBoxesClass, _id: false, default: [] }),
        __metadata("design:type", Array)
    ], UserClass.prototype, "boxes", void 0);
    UserClass = __decorate([
        typegoose_1.pre('save', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this;
                            return [4 /*yield*/, util.HashPass(this.password)];
                        case 1:
                            _a.password = _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }),
        typegoose_1.modelOptions({ schemaOptions: { collection: 'users' } })
    ], UserClass);
    return UserClass;
}());
exports.UserClass = UserClass;
exports.userModel = typegoose_1.getModelForClass(UserClass);
