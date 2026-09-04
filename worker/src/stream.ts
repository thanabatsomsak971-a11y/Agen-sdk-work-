import type { Env } from './env';
import { runInspectionTick } from './services/InspectionRunner';

/**
 * ReportStream — Durable Object that runs sub-minute inspection ticks.
 * Cron trigger fires every minute; if the user needs faster than that,
 * this DO uses alarms to tick every INSPECTION_INTERVAL_MS.
 *
 * v0.1: acts as a lightweight ticker; extend later to broadcast to
 * connected WebSocket clients (Cloudflare DOs support WebSocket hibernation).
 */
export class ReportStream implements DurableObject {
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === '/start' && req.method === 'POST') {
      const intervalMs = parseInt(this.env.INSPECTION_INTERVAL_MS, 10) || 60_000;
      await this.state.storage.setAlarm(Date.now() + intervalMs);
      return new Response(JSON.stringify({ ok: true, intervalMs }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    if (url.pathname === '/stop' && req.method === 'POST') {
      await this.state.storage.deleteAlarm();
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    if (url.pathname === '/status') {
      const next = await this.state.storage.getAlarm();
      return new Response(
        JSON.stringify({ running: next !== null, nextAlarmAt: next }),
        { headers: { 'content-type': 'application/json' } },
      );
    }

    return new Response('not found', { status: 404 });
  }

  async alarm(): Promise<void> {
    try {
      const ids = await runInspectionTick(this.env);
      console.log(`[ReportStream] tick generated ${ids.length} reports`);
    } catch (err) {
      console.error('[ReportStream] tick failed:', err);
    } finally {
      const intervalMs = parseInt(this.env.INSPECTION_INTERVAL_MS, 10) || 60_000;
      await this.state.storage.setAlarm(Date.now() + intervalMs);
    }
  }
}
