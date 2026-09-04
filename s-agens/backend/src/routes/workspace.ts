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

// ── Advanced routes (from Deep Reshare integration) ──

function handleError(err: unknown, label: string, res: any) {
  const raw = (err as Error).message;
  let message = raw;
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed?.error?.message) message = parsed.error.message;
    }
  } catch {
    // keep raw
  }
  // eslint-disable-next-line no-console
  console.error(`${label}:`, message);
  res.status(500).json({ error: message });
}

function unavailable(res: any) {
  res.status(503).json({
    error: codeAnalysis.configurationError() ?? 'Claude code analysis unavailable',
  });
}

// POST /api/workspace/analyze-codebase — multi-file analysis
const codebaseSchema = z.object({
  files: z.array(z.object({ name: z.string(), content: z.string() })).min(1).max(20),
});

router.post('/analyze-codebase', async (req, res) => {
  const parsed = codebaseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  if (!codeAnalysis.isAvailable()) return unavailable(res);
  try {
    const result = await codeAnalysis.analyzeCodebase(parsed.data.files);
    res.json({ result, model: codeAnalysis.getModel() });
  } catch (err) {
    handleError(err, 'Codebase analysis error', res);
  }
});

// POST /api/workspace/api-docs — generate API documentation
const apiDocsSchema = z.object({
  endpoints: z.array(z.object({
    method: z.string(),
    path: z.string(),
    description: z.string(),
  })).min(1).max(50),
});

router.post('/api-docs', async (req, res) => {
  const parsed = apiDocsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  if (!codeAnalysis.isAvailable()) return unavailable(res);
  try {
    const result = await codeAnalysis.generateAPIDocs(parsed.data.endpoints);
    res.json({ result, model: codeAnalysis.getModel() });
  } catch (err) {
    handleError(err, 'API docs error', res);
  }
});

// POST /api/workspace/optimize-db — database schema optimization
const dbSchema = z.object({
  entities: z.array(z.object({
    name: z.string(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
    })),
  })).min(1).max(20),
});

router.post('/optimize-db', async (req, res) => {
  const parsed = dbSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  if (!codeAnalysis.isAvailable()) return unavailable(res);
  try {
    const result = await codeAnalysis.optimizeDatabaseSchema(parsed.data.entities);
    res.json({ result, model: codeAnalysis.getModel() });
  } catch (err) {
    handleError(err, 'DB optimization error', res);
  }
});

// POST /api/workspace/generate-tests — test suite generation
const testSchema = z.object({
  code: z.string().min(1).max(10000),
  testType: z.enum(['unit', 'integration', 'e2e']).default('unit'),
});

router.post('/generate-tests', async (req, res) => {
  const parsed = testSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  if (!codeAnalysis.isAvailable()) return unavailable(res);
  try {
    const result = await codeAnalysis.generateTestSuite(parsed.data.code, parsed.data.testType);
    res.json({ result, model: codeAnalysis.getModel() });
  } catch (err) {
    handleError(err, 'Test generation error', res);
  }
});

// POST /api/workspace/deployment-guide — deployment guide generation
const deploySchema = z.object({
  techStack: z.array(z.string()).min(1).max(20),
  environment: z.enum(['dev', 'staging', 'prod']).default('dev'),
});

router.post('/deployment-guide', async (req, res) => {
  const parsed = deploySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  if (!codeAnalysis.isAvailable()) return unavailable(res);
  try {
    const result = await codeAnalysis.generateDeploymentGuide(
      parsed.data.techStack,
      parsed.data.environment,
    );
    res.json({ result, model: codeAnalysis.getModel() });
  } catch (err) {
    handleError(err, 'Deployment guide error', res);
  }
});

export default router;
