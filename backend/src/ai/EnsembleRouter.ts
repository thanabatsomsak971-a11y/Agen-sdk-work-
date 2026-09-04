import { env } from '../config/env';

/**
 * EnsembleRouter — talks to multiple AI brands.
 * Each brand is optional; router picks by keys available.
 * Structured suggestion only, decision belongs to caller.
 */

export type Brand = 'anthropic' | 'openai' | 'google';

export interface InspectPrompt {
  subjectKind: string;
  label: string;
  ctx: Record<string, unknown>;
}

export interface InspectAnswer {
  brand: Brand;
  status: 'ok' | 'warn' | 'alert';
  score: number;
  summary: string;
  raw?: unknown;
}

export class EnsembleRouter {
  availableBrands(): Brand[] {
    const b: Brand[] = [];
    if (env.ANTHROPIC_API_KEY) b.push('anthropic');
    if (env.OPENAI_API_KEY) b.push('openai');
    if (env.GOOGLE_API_KEY) b.push('google');
    return b;
  }

  /** Structural suggestion of which brand fits the task shape. No push. */
  suggestBrand(p: InspectPrompt): Brand | null {
    const avail = this.availableBrands();
    if (avail.length === 0) return null;
    // structural hints only; caller decides
    if (p.subjectKind === 'ai' && avail.includes('anthropic')) return 'anthropic';
    if (p.subjectKind === 'service' && avail.includes('openai')) return 'openai';
    return avail[0];
  }

  /**
   * Run inspection against a real AI provider.
   *
   * STATUS: NOT IMPLEMENTED — real provider calls (Anthropic/OpenAI/Google)
   * are not wired yet. Returns null so the InspectionRunner produces no
   * reports rather than fake/simulated data. Wiring is tracked in
   * docs/ROADMAP.md (v0.2).
   *
   * @returns null until real provider calls are implemented
   */
  async inspect(_p: InspectPrompt, _brand?: Brand): Promise<InspectAnswer | null> {
    return null;
  }
}

export const ensemble = new EnsembleRouter();
