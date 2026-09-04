import { Router } from 'express';
import { InspectionReport } from '../models/InspectionReport';

const router = Router();

router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? '50'), 10), 200);
  const q: Record<string, unknown> = {};
  if (req.query.subjectId) q.subjectId = String(req.query.subjectId);
  if (req.query.status) q.status = String(req.query.status);
  const items = await InspectionReport.find(q).sort({ createdAt: -1 }).limit(limit);
  res.json({ items });
});

router.get('/:id', async (req, res) => {
  const item = await InspectionReport.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});

export default router;
