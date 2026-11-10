import { Global, Module } from "@nestjs/common";
import Redis from "ioredis";
import { envs } from "../config";
import { REDIS_CLIENT } from "src/common/constants";

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: () => {
                return new Redis({
                    host: envs.redisHost ?? 'localhost',
                    port: envs.redisPort ?? 6379,
                    password: envs.redisPassword
                })
            }
        }
    ],
    exports: [REDIS_CLIENT],

})
export class RedisModule {}