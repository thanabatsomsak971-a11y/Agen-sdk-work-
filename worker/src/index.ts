import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { drizzle } from 'drizzle-orm/d1';
import type { Env } from './env';
import subjects from './routes/subjects';
import reports from './routes/reports';
import { EnsembleRouter } from './ai/EnsembleRouter';
import { runInspectionTick } from './services/InspectionRunner';
import { subjects as subjectsTable } from './db/schema';

export { ReportStream } from './stream';

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
  const origins = c.env.CORS_ORIGIN.split(',').map((s) => s.trim());
  return cors({ origin: origins, credentials: true })(c, next);
});

app.get('/', (c) =>
  c.json({
    name: 's-agens-api',
    version: '0.1.0',
    docs: 'https://github.com/thanabatsomsak971-a11y/agens-sdk-w11',
  }),
);

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }));

app.get('/api/ai/status', (c) => {
  const router = new EnsembleRouter(c.env);
  return c.json({
    available: router.availableBrands(),
    hint: 'Set ANTHROPIC_API_KEY / OPENAI_API_KEY / GOOGLE_API_KEY via `wrangler secret put`.',
  });
});

app.route('/api/subjects', subjects);
app.route('/api/reports', reports);

/** Fire-once trigger (useful for local dev without waiting for cron). */
app.post('/api/tick', async (c) => {
  const ids = await runInspectionTick(c.env);
  return c.json({ ok: true, generated: ids.length, ids });
});

/** Sub-minute streaming control (via Durable Object alarm). */
app.post('/api/stream/start', async (c) => {
  const id = c.env.STREAM.idFromName('default');
  const stub = c.env.STREAM.get(id);
  const res = await stub.fetch('https://do/start', { method: 'POST' });
  return c.json((await res.json()) as Record<string, unknown>);
});

app.post('/api/stream/stop', async (c) => {
  const id = c.env.STREAM.idFromName('default');
  const stub = c.env.STREAM.get(id);
  const res = await stub.fetch('https://do/stop', { method: 'POST' });
  return c.json((await res.json()) as Record<string, unknown>);
});

app.get('/api/stream/status', async (c) => {
  const id = c.env.STREAM.idFromName('default');
  const stub = c.env.STREAM.get(id);
  const res = await stub.fetch('https://do/status');
  return c.json((await res.json()) as Record<string, unknown>);
});

export default {
  fetch: app.fetch,

  // ---- Cron trigger (defined in wrangler.toml: every minute) ----
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        // Seed one subject on very first run so the demo shows something
        const db = drizzle(env.DB);
        const existing = await db.select({ id: subjectsTable.id }).from(subjectsTable).limit(1);
        if (existing.length === 0) {
          await db.insert(subjectsTable).values({
            id: crypto.randomUUID(),
            kind: 'ai',
            label: 'S-AGENS self-check',
            ctx: JSON.stringify({ note: 'sample seed; delete when real subjects exist' }),
            active: true,
          });
        }
        const ids = await runInspectionTick(env);
        console.log(`[cron] generated ${ids.length} reports`);
      })(),
    );
  },
};
