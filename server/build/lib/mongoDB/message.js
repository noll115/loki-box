"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageClass = exports.Message = exports.TextData = exports.Line = void 0;
var typegoose_1 = require("@typegoose/typegoose");
var user_1 = require("./user");
var box_1 = require("./box");
var Line = /** @class */ (function () {
    function Line() {
    }
    __decorate([
        typegoose_1.prop({ required: true }),
        __metadata("design:type", String)
    ], Line.prototype, "color", void 0);
    __decorate([
        typegoose_1.prop({ type: Number, required: true }),
        __metadata("design:type", Array)
    ], Line.prototype, "points", void 0);
    __decorate([
        typegoose_1.prop({ required: true }),
        __metadata("design:type", Number)
    ], Line.prototype, "lineWidth", void 0);
    return Line;
}());
exports.Line = Line;
var TextData = /** @class */ (function () {
    function TextData() {
    }
    __decorate([
        typegoose_1.prop({ required: true }),
        __metadata("design:type", String)
    ], TextData.prototype, "text", void 0);
    __decorate([
        typegoose_1.prop({ required: true }),
        __metadata("design:type", Number)
    ], TextData.prototype, "txtSize", void 0);
    __decorate([
        typegoose_1.prop({ type: Number, required: true }),
        __metadata("design:type", Array)
    ], TextData.prototype, "pos", void 0);
    __decorate([
        typegoose_1.prop({ required: true }),
        __metadata("design:type", String)
    ], TextData.prototype, "color", void 0);
    return TextData;
}());
exports.TextData = TextData;
var Message = /** @class */ (function () {
    function Message() {
    }
    __decorate([
        typegoose_1.prop({ type: Line, _id: false, required: true }),
        __metadata("design:type", Array)
    ], Message.prototype, "lines", void 0);
    __decorate([
        typegoose_1.prop({ type: TextData, _id: false, required: true }),
        __metadata("design:type", Array)
    ], Message.prototype, "texts", void 0);
    return Message;
}());
exports.Message = Message;
var MessageClass = /** @class */ (function () {
    function MessageClass() {
    }
    __decorate([
        typegoose_1.prop({ default: Date.now }),
        __metadata("design:type", Date)
    ], MessageClass.prototype, "sentTime", void 0);
    __decorate([
        typegoose_1.prop({ default: false }),
        __metadata("design:type", Boolean)
    ], MessageClass.prototype, "seen", void 0);
    __decorate([
        typegoose_1.prop({ _id: false, required: true }),
        __metadata("design:type", Message)
    ], MessageClass.prototype, "data", void 0);
    __decorate([
        typegoose_1.prop({ ref: function () { return box_1.BoxClass; }, required: true, index: true }),
        __metadata("design:type", Object)
    ], MessageClass.prototype, "to", void 0);
    __decorate([
        typegoose_1.prop({ ref: function () { return user_1.UserClass; }, required: true, index: true }),
        __metadata("design:type", Object)
    ], MessageClass.prototype, "from", void 0);
    __decorate([
        typegoose_1.prop({ required: true }),
        __metadata("design:type", String)
    ], MessageClass.prototype, "fromSeenAs", void 0);
    MessageClass = __decorate([
        typegoose_1.ModelOptions({ schemaOptions: { collection: 'messages' } })
    ], MessageClass);
    return MessageClass;
}());
exports.MessageClass = MessageClass;
var messageModel = typegoose_1.getModelForClass(MessageClass);
exports.default = messageModel;
