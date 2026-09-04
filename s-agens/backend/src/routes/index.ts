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
  });
});

api.use('/subjects', subjects);
api.use('/reports', reports);

export default api;
