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
      this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
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
