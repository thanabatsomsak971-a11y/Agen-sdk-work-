import { Server as IOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { env } from '../config/env';

export function createIO(http: HttpServer): IOServer {
  const io = new IOServer(http, {
    cors: {
      origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log('🔌 client connected', socket.id);
    socket.emit('hello', { ts: Date.now() });
    socket.on('disconnect', (reason) => {
      // eslint-disable-next-line no-console
      console.log('🔌 client left', socket.id, reason);
    });
  });

  return io;
}
