import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import type { Env } from '../env';
import { subjects } from '../db/schema';

const app = new Hono<{ Bindings: Env }>();

const createSchema = z.object({
  kind: z.string().min(1).max(64),
  label: z.string().min(1).max(200),
  ctx: z.record(z.unknown()).optional().default({}),
  active: z.boolean().optional().default(true),
});

const patchSchema = z.object({
  label: z.string().min(1).max(200).optional(),
  ctx: z.record(z.unknown()).optional(),
  active: z.boolean().optional(),
});

app.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const items = await db.select().from(subjects).orderBy(desc(subjects.createdAt)).limit(100);
  return c.json({ items: items.map(hydrate) });
});

app.post('/', async (c) => {
  const parsed = createSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const db = drizzle(c.env.DB);
  const id = crypto.randomUUID();
  await db.insert(subjects).values({
    id,
    kind: parsed.data.kind,
    label: parsed.data.label,
    ctx: JSON.stringify(parsed.data.ctx),
    active: parsed.data.active,
  });
  const [created] = await db.select().from(subjects).where(eq(subjects.id, id));
  return c.json(hydrate(created!), 201);
});

app.patch('/:id', async (c) => {
  const parsed = patchSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const db = drizzle(c.env.DB);
  const patch: Record<string, unknown> = { updatedAt: Math.floor(Date.now() / 1000) };
  if (parsed.data.label !== undefined) patch.label = parsed.data.label;
  if (parsed.data.ctx !== undefined) patch.ctx = JSON.stringify(parsed.data.ctx);
  if (parsed.data.active !== undefined) patch.active = parsed.data.active;

  await db.update(subjects).set(patch as any).where(eq(subjects.id, c.req.param('id')));
  const [updated] = await db.select().from(subjects).where(eq(subjects.id, c.req.param('id')));
  if (!updated) return c.json({ error: 'not_found' }, 404);
  return c.json(hydrate(updated));
});

app.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  await db.delete(subjects).where(eq(subjects.id, c.req.param('id')));
  return new Response(null, { status: 204 });
});

function hydrate(row: typeof subjects.$inferSelect) {
  return {
    ...row,
    ctx: safeParse(row.ctx),
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
