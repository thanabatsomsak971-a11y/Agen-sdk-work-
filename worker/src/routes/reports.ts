import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { and, desc, eq, gt } from 'drizzle-orm';
import type { Env } from '../env';
import { reports } from '../db/schema';

const app = new Hono<{ Bindings: Env }>();

/**
 * List reports.
 * Query params:
 *   ?limit=50          (max 200)
 *   ?subjectId=<id>
 *   ?status=ok|warn|alert
 *   ?sinceTs=<unix>    (return reports created after this timestamp — used for polling)
 */
app.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 200);
  const conditions = [];

  const subjectId = c.req.query('subjectId');
  if (subjectId) conditions.push(eq(reports.subjectId, subjectId));

  const status = c.req.query('status');
  if (status && ['ok', 'warn', 'alert'].includes(status)) {
    conditions.push(eq(reports.status, status as 'ok' | 'warn' | 'alert'));
  }

  const sinceTs = c.req.query('sinceTs');
  if (sinceTs) conditions.push(gt(reports.createdAt, parseInt(sinceTs, 10)));

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(reports)
          .where(and(...conditions))
          .orderBy(desc(reports.createdAt))
          .limit(limit)
      : await db.select().from(reports).orderBy(desc(reports.createdAt)).limit(limit);

  return c.json({
    items: rows.map(hydrate),
    serverTs: Math.floor(Date.now() / 1000),
  });
});

app.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const [row] = await db.select().from(reports).where(eq(reports.id, c.req.param('id')));
  if (!row) return c.json({ error: 'not_found' }, 404);
  return c.json(hydrate(row));
});

function hydrate(row: typeof reports.$inferSelect) {
  return {
    ...row,
    detail: safeParse(row.detail),
  };
}
function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

export default app;
