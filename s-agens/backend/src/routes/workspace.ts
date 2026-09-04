import { Router } from 'express';
import { z } from 'zod';
import { getWorkspaceConfig } from '../config/workspace';
import { codeAnalysis } from '../ai/CodeAnalysis';

const router = Router();

// GET /api/workspace/config — real env var status (no values exposed)
router.get('/config', (_req, res) => {
  res.json(getWorkspaceConfig());
});

// POST /api/workspace/analyze — real Claude code analysis
const analyzeSchema = z.object({
  code: z.string().min(1).max(10000),
  language: z.string().optional().default('typescript'),
});

router.post('/analyze', async (req, res) => {
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  if (!codeAnalysis.isAvailable()) {
    res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' });
    return;
  }

  try {
    const result = await codeAnalysis.analyzeCode(parsed.data.code, parsed.data.language);
    res.json({ result, model: codeAnalysis.getModel() });
  } catch (err) {
    const raw = (err as Error).message;
    let message = raw;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed2 = JSON.parse(match[0]);
        if (parsed2?.error?.message) message = parsed2.error.message;
      }
    } catch {
      // keep raw
    }
    // eslint-disable-next-line no-console
    console.error('Code analysis error:', message);
    res.status(500).json({ error: message });
  }
});

// POST /api/workspace/document — generate documentation via real Claude
const docSchema = z.object({
  typeName: z.string().min(1),
  code: z.string().min(1).max(10000),
});

router.post('/document', async (req, res) => {
  const parsed = docSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  if (!codeAnalysis.isAvailable()) {
    res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' });
    return;
  }

  try {
    const result = await codeAnalysis.generateDocumentation(parsed.data.typeName, parsed.data.code);
    res.json({ result, model: codeAnalysis.getModel() });
  } catch (err) {
    const raw = (err as Error).message;
    let message = raw;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed2 = JSON.parse(match[0]);
        if (parsed2?.error?.message) message = parsed2.error.message;
      }
    } catch {
      // keep raw
    }
    // eslint-disable-next-line no-console
    console.error('Documentation generation error:', message);
    res.status(500).json({ error: message });
  }
});

// POST /api/workspace/improve — suggest improvements via real Claude
const improveSchema = z.object({
  code: z.string().min(1).max(10000),
  context: z.string().optional(),
});

router.post('/improve', async (req, res) => {
  const parsed = improveSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  if (!codeAnalysis.isAvailable()) {
    res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' });
    return;
  }

  try {
    const result = await codeAnalysis.suggestImprovements(parsed.data.code, parsed.data.context);
    res.json({ result, model: codeAnalysis.getModel() });
  } catch (err) {
    const raw = (err as Error).message;
    let message = raw;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed2 = JSON.parse(match[0]);
        if (parsed2?.error?.message) message = parsed2.error.message;
      }
    } catch {
      // keep raw
    }
    // eslint-disable-next-line no-console
    console.error('Code improvement error:', message);
    res.status(500).json({ error: message });
  }
});

export default router;
