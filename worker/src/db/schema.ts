import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Inspection Subject — the thing being watched.
 */
export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(), // uuid string
  ownerId: text('owner_id'),
  kind: text('kind').notNull(),
  label: text('label').notNull(),
  ctx: text('ctx').notNull().default('{}'), // JSON string
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
});

/**
 * Inspection Report — a single observation about a subject.
 */
export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').notNull(),
  subjectKind: text('subject_kind').notNull(),
  status: text('status', { enum: ['ok', 'warn', 'alert'] }).notNull(),
  score: integer('score').notNull(),
  summary: text('summary').notNull(),
  detail: text('detail').notNull().default('{}'),
  aiProvider: text('ai_provider'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
