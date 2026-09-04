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
  brand: Brand | 'stub';
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
   * Run inspection. If no keys configured, returns a deterministic stub so
   * the whole pipeline can be developed without API cost.
   */
  async inspect(p: InspectPrompt, brand?: Brand): Promise<InspectAnswer> {
    const chosen = brand ?? this.suggestBrand(p);
    if (!chosen) return this.stub(p);

    // TODO: real provider calls; keep as stub for scaffold so it runs offline.
    // Wiring examples in docs/ROADMAP.md.
    return this.stub(p, chosen);
  }

  private stub(p: InspectPrompt, brand: Brand | 'stub' = 'stub'): InspectAnswer {
    const score = 60 + Math.floor(Math.random() * 40);
    const status = score > 85 ? 'ok' : score > 65 ? 'warn' : 'alert';
    return {
      brand,
      status,
      score,
      summary: `[${brand}] ${p.label} (${p.subjectKind}) → ${status} (${score})`,
    };
  }
}

export const ensemble = new EnsembleRouter();
