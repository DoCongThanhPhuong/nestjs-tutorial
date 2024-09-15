import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      url: 'redis://localhost:6379',
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));

    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }

  async setNXWithExpiration(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const result = await this.client.setNX(key, value);
    if (result) {
      await this.client.expire(key, ttlSeconds);
    }
    return result;
  }

  async getKey(key: string): Promise<string> {
    const result = await this.client.get(key);
    return result;
  }

  async deleteKey(key: string): Promise<number> {
    const result = await this.client.del(key);
    return result;
  }
}
