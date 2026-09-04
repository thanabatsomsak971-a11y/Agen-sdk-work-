import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * ClaudeChat — real Anthropic API integration for conversational chat.
 * No stub, no mock. If ANTHROPIC_API_KEY is missing, isAvailable() returns false
 * and chat() throws — the UI must show the real status, never fake success.
 */
export class ClaudeChat {
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
      } else if (env.ANTHROPIC_WORKSPACE_ID) {
        // eslint-disable-next-line no-console
        console.warn(
          '⚠ ANTHROPIC_WORKSPACE_ID is set but not in valid format (must start with wrkspc_). ' +
            'Skipping header — API may reject requests.',
        );
      }
      this.client = new Anthropic(opts);
    }
  }

  isAvailable(): boolean {
    return this.client !== null && this.configurationError() === null;
  }

  configurationError(): string | null {
    if (!env.ANTHROPIC_API_KEY) return 'ANTHROPIC_API_KEY not configured';
    if (env.ANTHROPIC_WORKSPACE_ID && !env.ANTHROPIC_WORKSPACE_ID.startsWith('wrkspc_')) {
      return 'ANTHROPIC_WORKSPACE_ID must start with wrkspc_ for this identity-linked API key';
    }
    return null;
  }

  getModel(): string {
    return env.ANTHROPIC_MODEL;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.client) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await this.client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 1024,
      system:
        'You are S-AI, an AI assistant integrated into the S-AI Workspace Shell. ' +
        'Respond concisely and helpfully. You can see the user is using the S-AI system.',
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return text;
  }
}

export const claudeChat = new ClaudeChat();
