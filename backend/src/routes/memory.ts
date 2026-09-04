import { Router } from 'express';
import { z } from 'zod';
import { MemoryLog } from '../models/MemoryLog';

const router = Router();

const createSchema = z.object({
  category: z.string().min(1).max(64),
  content: z.string().min(1).max(8000),
  tags: z.array(z.string().max(64)).max(20).optional().default([]),
  source: z.string().min(1).max(64).optional().default('manual'),
  metadata: z.record(z.unknown()).optional().default({}),
});

// GET /api/memory?q=&category=&tag=&limit=
router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? '100'), 10), 500);
  const q: Record<string, unknown> = {};

  const text = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (text) q.$text = { $search: text };

  if (req.query.category) q.category = String(req.query.category);
  if (req.query.tag) q.tags = String(req.query.tag);

  const items = await MemoryLog.find(q).sort({ createdAt: -1 }).limit(limit);
  res.json({ items });
});

// POST /api/memory
router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const created = await MemoryLog.create(parsed.data);
  res.status(201).json(created);
});

// GET /api/memory/:id
router.get('/:id', async (req, res) => {
  const item = await MemoryLog.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});

// DELETE /api/memory/:id
router.delete('/:id', async (req, res) => {
  const deleted = await MemoryLog.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'not_found' });
  res.status(204).end();
});

export default router;
