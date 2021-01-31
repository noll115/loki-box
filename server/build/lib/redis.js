"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisSocket = exports.createRedisAdapter = void 0;
var socket_io_redis_1 = require("socket.io-redis");
var redis_1 = require("redis");
var typegoose_1 = require("@typegoose/typegoose");
var mongoDB_1 = require("./mongoDB");
var createRedisAdapter = function () {
    var pubClient = new redis_1.RedisClient({ host: 'localhost', port: 6379 });
    var subClient = pubClient.duplicate();
    return { adapter: socket_io_redis_1.createAdapter({ pubClient: pubClient, subClient: subClient }), redisClient: pubClient };
};
exports.createRedisAdapter = createRedisAdapter;
var RedisSocket = /** @class */ (function () {
    function RedisSocket(redisClient) {
        this.redisClient = redisClient;
    }
    RedisSocket.prototype.addSocket = function (user, socketID) {
        var _this = this;
        return new Promise(function (res, rej) {
            var type = typegoose_1.getClass(user) === mongoDB_1.UserClass ? 'user' : 'box';
            _this.redisClient.set(type + ":" + user.id, socketID, function (err) {
                if (err)
                    return rej(err);
                res();
            });
        });
    };
    RedisSocket.prototype.removeSocket = function (doc) {
        var _this = this;
        return new Promise(function (res, rej) {
            _this.redisClient.del("user:" + doc.id, function (err) {
                if (err)
                    return rej(err);
                res();
            });
        });
    };
    RedisSocket.prototype.getSocket = function (type, docID) {
        var _this = this;
        return new Promise(function (res, rej) {
            _this.redisClient.get(type + ":" + docID, function (err, reply) {
                if (err)
                    return rej(err);
                res(reply);
            });
        });
    };
    return RedisSocket;
}());
exports.RedisSocket = RedisSocket;
