import mongoose from 'mongoose';
import { env } from './env';

export async function connectMongo(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URL, {
    serverSelectionTimeoutMS: 10_000,
  });
  // eslint-disable-next-line no-console
  console.log('✅ MongoDB connected');
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
