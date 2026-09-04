import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';

/**
 * CodeAnalysis — real Anthropic API integration for code analysis tasks.
 * Reuses the same API key + workspace config as ClaudeChat.
 * No stub, no mock. If ANTHROPIC_API_KEY is missing, methods throw.
 */
export class CodeAnalysis {
  private client: Anthropic | null = null;

  constructor() {
    if (env.ANTHROPIC_API_KEY) {
      const opts: ConstructorParameters<typeof Anthropic>[0] = {
        apiKey: env.ANTHROPIC_API_KEY,
      };
      if (env.ANTHROPIC_WORKSPACE_ID && env.ANTHROPIC_WORKSPACE_ID.startsWith('wrkspc_')) {
        opts.defaultHeaders = {
          'anthropic-workspace-id': env.ANTHROPIC_WORKSPACE_ID,
        };
      }
      this.client = new Anthropic(opts);
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getModel(): string {
    return env.ANTHROPIC_MODEL;
  }

  private async call(prompt: string, maxTokens: number): Promise<string> {
    if (!this.client) throw new Error('ANTHROPIC_API_KEY not configured');

    const response = await this.client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system: 'You are S-AI Code Analyst. Respond in clear, structured markdown.',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');
  }

  async analyzeCode(code: string, language = 'typescript'): Promise<string> {
    return this.call(
      `Analyze this ${language} code and provide insights:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n` +
        'Please provide:\n1. Code quality assessment\n2. Security vulnerabilities\n' +
        '3. Performance improvements\n4. Best practices recommendations',
      1024,
    );
  }

  async generateDocumentation(typeName: string, code: string): Promise<string> {
    return this.call(
      `Generate comprehensive TypeScript documentation for:\n\nType: ${typeName}\n` +
        `Code:\n\`\`\`typescript\n${code}\n\`\`\`\n\n` +
        'Create documentation including:\n1. Overview and purpose\n' +
        '2. Constructor parameters\n3. Public methods with JSDoc\n' +
        '4. Properties and types\n5. Usage examples',
      1536,
    );
  }

  async suggestImprovements(code: string, context?: string): Promise<string> {
    return this.call(
      `Analyze this code and suggest improvements:\n\n` +
        `${context ? `Context: ${context}\n\n` : ''}` +
        `\`\`\`typescript\n${code}\n\`\`\`\n\n` +
        'Please provide:\n1. Code structure improvements\n2. Performance optimizations\n' +
        '3. Security enhancements\n4. TypeScript best practices\n5. Refactoring suggestions',
      1200,
    );
  }

  // ── Advanced capabilities (from Deep Reshare integration) ──
  // All return raw Claude text — no hardcoded parsing or fake structured data.

  async analyzeCodebase(files: { name: string; content: string }[]): Promise<string> {
    const fileDescriptions = files
      .map((f) => `### ${f.name}\n\`\`\`\n${f.content}\n\`\`\``)
      .join('\n\n');
    return this.call(
      `Analyze this codebase (${files.length} files):\n\n${fileDescriptions}\n\n` +
        'Provide:\n1. Overall quality assessment\n2. Architecture insights\n' +
        '3. Issues found per file\n4. Consolidated recommendations',
      2048,
    );
  }

  async generateAPIDocs(
    endpoints: { method: string; path: string; description: string }[],
  ): Promise<string> {
    const list = endpoints.map((ep) => `- ${ep.method} ${ep.path}: ${ep.description}`).join('\n');
    return this.call(
      `Generate comprehensive API documentation for these endpoints:\n\n${list}\n\n` +
        'Create:\n1. OpenAPI/Swagger documentation\n2. Request/response examples\n' +
        '3. Error handling\n4. Authentication requirements\n5. Usage examples in TypeScript',
      2048,
    );
  }

  async optimizeDatabaseSchema(
    entities: { name: string; fields: { name: string; type: string; required: boolean }[] }[],
  ): Promise<string> {
    const desc = entities
      .map(
        (e) =>
          `Entity: ${e.name}\nFields: ${e.fields
            .map((f) => `${f.name}: ${f.type}${f.required ? '' : '?'}`)
            .join(', ')}`,
      )
      .join('\n\n');
    return this.call(
      `Optimize this database schema for performance and scalability:\n\n${desc}\n\n` +
        'Provide:\n1. Optimized schema definition\n2. Recommended indexes\n' +
        '3. Performance tips\n4. Migration scripts (MongoDB/Mongoose)',
      2048,
    );
  }

  async generateTestSuite(
    code: string,
    testType: 'unit' | 'integration' | 'e2e',
  ): Promise<string> {
    return this.call(
      `Generate comprehensive ${testType} tests for this TypeScript code:\n\n` +
        `\`\`\`typescript\n${code}\n\`\`\`\n\n` +
        'Create:\n1. Complete test file with Vitest\n2. Mock implementations\n' +
        '3. Edge case testing\n4. Error scenario testing',
      2048,
    );
  }

  async generateDeploymentGuide(
    techStack: string[],
    environment: 'dev' | 'staging' | 'prod',
  ): Promise<string> {
    return this.call(
      `Generate deployment guide for ${environment} environment:\n\n` +
        `Tech Stack: ${techStack.join(', ')}\n\n` +
        'Include:\n1. Step-by-step deployment process\n2. Required environment variables\n' +
        '3. Monitoring setup\n4. Troubleshooting common issues\n5. Scaling strategies',
      2048,
    );
  }
}

export const codeAnalysis = new CodeAnalysis();
