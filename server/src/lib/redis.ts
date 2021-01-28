import { createAdapter, RedisAdapter } from 'socket.io-redis';
import { RedisClient } from "redis";
import { DocumentType, getClass } from '@typegoose/typegoose';
import { BoxClass, UserClass } from './mongoDB';
import { MessageClass } from './mongoDB/message';

export const createRedisAdapter = () => {
    const pubClient = new RedisClient({ host: 'localhost', port: 6379 });
    const subClient = pubClient.duplicate();
    return { adapter: createAdapter({ pubClient, subClient }), redisClient: pubClient };
}


export class RedisSocket {

    constructor(private redisClient: RedisClient) { }

    addSocket(user: DocumentType<UserClass | BoxClass>, socketID: string): Promise<void> {
        return new Promise((res, rej) => {
            const type: string = getClass(user) === UserClass ? 'user' : 'box';
            this.redisClient.set(`${type}:${user.id}`, socketID, err => {
                if (err) return rej(err)
                res();
            })
        })
    }

    removeSocket(doc: DocumentType<UserClass | BoxClass>): Promise<void> {
        return new Promise((res, rej) => {
            this.redisClient.del(`user:${doc.id}`, err => {
                if (err) return rej(err);
                res();
            })
        });
    }

    getSocket(type: 'user' | 'box', docID: string): Promise<string | null> {
        return new Promise((res, rej) => {
            this.redisClient.get(`${type}:${docID}`, (err, reply) => {
                if (err) return rej(err);
                res(reply);
            })
        })
    }
    
}
