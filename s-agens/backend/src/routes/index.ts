import { Router } from 'express';
import subjects from './subjects';
import reports from './reports';
import chat from './chat';
import { ensemble } from '../ai/EnsembleRouter';
import { claudeChat } from '../ai/ClaudeChat';

const api = Router();

api.get('/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

api.get('/ai/status', (_req, res) => {
  res.json({
    available: ensemble.availableBrands(),
    chat: {
      claude: claudeChat.isAvailable(),
      model: claudeChat.isAvailable() ? claudeChat.getModel() : null,
    },
  });
});

api.use('/subjects', subjects);
api.use('/reports', reports);
api.use('/chat', chat);

export default api;
