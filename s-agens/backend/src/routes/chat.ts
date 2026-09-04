import { Router } from 'express';
import { z } from 'zod';
import { claudeChat, type ChatMessage } from '../ai/ClaudeChat';

const chat = Router();

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1),
      }),
    )
    .min(1),
});

chat.post('/', async (req, res) => {
  if (!claudeChat.isAvailable()) {
    return res.status(503).json({
      error: 'ANTHROPIC_API_KEY not configured — Claude chat unavailable',
    });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    const reply = await claudeChat.chat(parsed.data.messages as ChatMessage[]);
    res.json({ reply, model: claudeChat.getModel() });
  } catch (err) {
    const message = (err as Error).message;
    const status = message.includes('401') || message.includes('403')
      ? 401
      : message.includes('429')
        ? 429
        : 500;
    // eslint-disable-next-line no-console
    console.error('Claude chat error:', message);
    res.status(status).json({ error: message });
  }
});

export default chat;
