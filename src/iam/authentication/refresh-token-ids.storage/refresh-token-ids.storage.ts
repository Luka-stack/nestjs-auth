import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Redis } from 'ioredis';

// TODO Ideally, we should move this to the dedicated class
export class InvalidatedRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redisClient: Redis;

  onApplicationShutdown(signal?: string) {
    return this.redisClient.quit();
  }

  onApplicationBootstrap() {
    // TODO Ideally, we should move this to the dedicated "RedisModule"
    // instead of initiaing the connection here.

    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async insert(userId: number, tokenid: string): Promise<void> {
    await this.redisClient.set(this.getKey(userId), tokenid);
  }

  async validate(userId: number, tokenId: string): Promise<boolean> {
    const storedId = await this.redisClient.get(this.getKey(userId));

    if (storedId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }

    return true;
  }

  async invalidate(userId: number): Promise<void> {
    await this.redisClient.del(this.getKey(userId));
  }

  private getKey(userId: number): string {
    return `user-${userId}`;
  }
}
