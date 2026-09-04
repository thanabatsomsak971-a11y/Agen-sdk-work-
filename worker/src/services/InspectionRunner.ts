import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import type { Env } from '../env';
import { subjects, reports } from '../db/schema';
import { EnsembleRouter } from '../ai/EnsembleRouter';

/**
 * Run one inspection tick — called by cron trigger.
 * Iterates active subjects, asks ensemble, persists reports.
 * Returns the ids of new reports so the DO can broadcast them.
 */
export async function runInspectionTick(env: Env): Promise<string[]> {
  const db = drizzle(env.DB);
  const active = await db.select().from(subjects).where(eq(subjects.active, true)).limit(20);

  const router = new EnsembleRouter(env);
  const newIds: string[] = [];

  for (const s of active) {
    let ctx: Record<string, unknown> = {};
    try {
      ctx = JSON.parse(s.ctx);
    } catch {
      ctx = {};
    }

    const answer = await router.inspect({ subjectKind: s.kind, label: s.label, ctx });

    const id = crypto.randomUUID();
    await db.insert(reports).values({
      id,
      subjectId: s.id,
      subjectKind: s.kind,
      status: answer.status,
      score: answer.score,
      summary: answer.summary,
      detail: JSON.stringify(answer.raw ?? {}),
      aiProvider: answer.brand,
    });
    newIds.push(id);
  }

  return newIds;
}
