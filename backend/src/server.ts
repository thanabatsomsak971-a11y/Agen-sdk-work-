import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { connectMongo } from './config/database';
import { connectRedis } from './config/cache';
import { connectElasticsearch } from './config/elasticsearch';
import { createIO } from './ws/gateway';
import api from './routes';
import { InspectionRunner } from './services/InspectionRunner';
import { InspectionSubject } from './models/InspectionSubject';

async function main(): Promise<void> {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', api);

  const httpServer = http.createServer(app);
  const io = createIO(httpServer);

  await connectMongo();
  await connectRedis();
  await connectElasticsearch();

  // Seed one sample subject on first run so the demo shows something moving
  const count = await InspectionSubject.estimatedDocumentCount();
  if (count === 0) {
    await InspectionSubject.create({
      kind: 'ai',
      label: 'S-AGENS self-check',
      ctx: { note: 'sample seed; delete when real subjects exist' },
    });
    // eslint-disable-next-line no-console
    console.log('🌱 seeded sample inspection subject');
  }

  const runner = new InspectionRunner(io);
  runner.start();

  httpServer.listen(env.BACKEND_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 S-AGENS backend on :${env.BACKEND_PORT}`);
  });

  const shutdown = async (): Promise<void> => {
    // eslint-disable-next-line no-console
    console.log('👋 shutting down...');
    runner.stop();
    httpServer.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal:', err);
  process.exit(1);
});
