import { Router } from 'express';
import { z } from 'zod';
import { InspectionSubject } from '../models/InspectionSubject';

const router = Router();

const createSchema = z.object({
  kind: z.string().min(1).max(64),
  label: z.string().min(1).max(200),
  ctx: z.record(z.unknown()).optional().default({}),
  active: z.boolean().optional().default(true),
});

router.get('/', async (_req, res) => {
  const items = await InspectionSubject.find().sort({ createdAt: -1 }).limit(100);
  res.json({ items });
});

router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const created = await InspectionSubject.create(parsed.data);
  res.status(201).json(created);
});

router.patch('/:id', async (req, res) => {
  const patch = z
    .object({
      label: z.string().min(1).max(200).optional(),
      ctx: z.record(z.unknown()).optional(),
      active: z.boolean().optional(),
    })
    .safeParse(req.body);
  if (!patch.success) return res.status(400).json({ error: patch.error.flatten() });
  const updated = await InspectionSubject.findByIdAndUpdate(req.params.id, patch.data, {
    new: true,
  });
  if (!updated) return res.status(404).json({ error: 'not_found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await InspectionSubject.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'not_found' });
  res.status(204).end();
});

export default router;
