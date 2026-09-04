import { createClient, RedisClientType } from 'redis';
import { env } from './env';

let client: RedisClientType | null = null;

export async function connectRedis(): Promise<RedisClientType> {
  if (client) return client;
  client = createClient({ url: env.REDIS_URL });
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  // eslint-disable-next-line no-console
  console.log('✅ Redis connected');
  return client;
}

export function getRedis(): RedisClientType {
  if (!client) throw new Error('Redis not connected. Call connectRedis() first.');
  return client;
}
