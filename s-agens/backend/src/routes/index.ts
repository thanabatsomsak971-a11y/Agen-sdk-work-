import { Router } from 'express';
import subjects from './subjects';
import reports from './reports';
import { ensemble } from '../ai/EnsembleRouter';

const api = Router();

api.get('/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

api.get('/ai/status', (_req, res) => {
  res.json({
    available: ensemble.availableBrands(),
    hint: 'Set ANTHROPIC_API_KEY / OPENAI_API_KEY / GOOGLE_API_KEY in .env to activate.',
  });
});

api.use('/subjects', subjects);
api.use('/reports', reports);

export default api;
