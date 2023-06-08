import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private readonly redisClient: Redis;
    constructor() {
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST,
            port: 6379,
            password: process.env.REDIS_PASSWORD
        });
    }
    async setRedis(key: string, value: any) {
        console.log(key,value);
        // const redis = new Redis({
        //     host: process.env.REDIS_HOST,
        //     port: 6379,
        //     password: process.env.REDIS_PASSWORD
        // });
        // redis.set(key, value)
        this.redisClient.set(key, value)
    }

    async getRedis(key: string) {
        // const redis = new Redis({
        //     host: process.env.REDIS_HOST,
        //     port: 6379,
        //     password: process.env.REDIS_PASSWORD
        // });
        // redis.get(key)
        this.redisClient.get(key)
    }
}