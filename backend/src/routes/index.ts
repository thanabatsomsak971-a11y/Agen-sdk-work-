import { Router } from 'express';
import subjects from './subjects';
import reports from './reports';
import memory from './memory';
import { ensemble } from '../ai/EnsembleRouter';
import { getElasticsearch } from '../config/elasticsearch';

const api = Router();

api.get('/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

api.get('/es/status', async (_req, res) => {
  try {
    const es = getElasticsearch();
    const health = await es.cluster.health();
    res.json({
      connected: true,
      status: health.status,
      cluster: health.cluster_name,
      numberOfNodes: health.number_of_nodes,
    });
  } catch (err) {
    res.status(503).json({ connected: false, error: (err as Error).message });
  }
});

api.get('/ai/status', (_req, res) => {
  res.json({
    available: ensemble.availableBrands(),
    hint: 'Set ANTHROPIC_API_KEY / OPENAI_API_KEY / GOOGLE_API_KEY in .env to activate.',
  });
});

api.use('/subjects', subjects);
api.use('/reports', reports);
api.use('/memory', memory);

export default api;
