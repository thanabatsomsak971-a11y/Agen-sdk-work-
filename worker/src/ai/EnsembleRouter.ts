import type { Env } from '../env';

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

/**
 * EnsembleRouter — provider-agnostic, structural suggestion only.
 * No key → deterministic stub so the whole pipeline runs offline.
 */
export class EnsembleRouter {
  constructor(private env: Env) {}

  availableBrands(): Brand[] {
    const b: Brand[] = [];
    if (this.env.ANTHROPIC_API_KEY) b.push('anthropic');
    if (this.env.OPENAI_API_KEY) b.push('openai');
    if (this.env.GOOGLE_API_KEY) b.push('google');
    return b;
  }

  suggestBrand(p: InspectPrompt): Brand | null {
    const avail = this.availableBrands();
    if (avail.length === 0) return null;
    if (p.subjectKind === 'ai' && avail.includes('anthropic')) return 'anthropic';
    if (p.subjectKind === 'service' && avail.includes('openai')) return 'openai';
    return avail[0];
  }

  async inspect(p: InspectPrompt, brand?: Brand): Promise<InspectAnswer> {
    const chosen = brand ?? this.suggestBrand(p);
    if (!chosen) return this.stub(p);

    try {
      if (chosen === 'anthropic') return await this.callAnthropic(p);
      if (chosen === 'openai') return await this.callOpenAI(p);
      if (chosen === 'google') return await this.callGoogle(p);
    } catch (err) {
      console.error(`[${chosen}] call failed, falling back to stub:`, err);
    }
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

  // ----- Provider calls (all via fetch — Workers-native) -----

  private async callAnthropic(p: InspectPrompt): Promise<InspectAnswer> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 200,
        system: this.systemPrompt(),
        messages: [{ role: 'user', content: this.userPrompt(p) }],
      }),
    });
    const json: any = await res.json();
    const text = json?.content?.[0]?.text ?? '';
    return this.parseAiText(text, 'anthropic', p, json);
  }

  private async callOpenAI(p: InspectPrompt): Promise<InspectAnswer> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.env.OPENAI_API_KEY!}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 200,
        messages: [
          { role: 'system', content: this.systemPrompt() },
          { role: 'user', content: this.userPrompt(p) },
        ],
      }),
    });
    const json: any = await res.json();
    const text = json?.choices?.[0]?.message?.content ?? '';
    return this.parseAiText(text, 'openai', p, json);
  }

  private async callGoogle(p: InspectPrompt): Promise<InspectAnswer> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.env.GOOGLE_API_KEY!}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: this.systemPrompt() }] },
        contents: [{ role: 'user', parts: [{ text: this.userPrompt(p) }] }],
      }),
    });
    const json: any = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return this.parseAiText(text, 'google', p, json);
  }

  private systemPrompt(): string {
    return [
      'You are an inspection agent for the S-AGENS platform.',
      'Given a subject description, return ONE line of JSON with keys:',
      '{"status":"ok"|"warn"|"alert","score":0-100,"summary":"<one short sentence>"}',
      'No preamble, no code fences, JSON only.',
    ].join(' ');
  }

  private userPrompt(p: InspectPrompt): string {
    return `Subject kind: ${p.subjectKind}\nLabel: ${p.label}\nContext: ${JSON.stringify(p.ctx)}`;
  }

  private parseAiText(
    text: string,
    brand: Brand,
    p: InspectPrompt,
    raw: unknown,
  ): InspectAnswer {
    try {
      const cleaned = text.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
      const parsed = JSON.parse(cleaned);
      const status = ['ok', 'warn', 'alert'].includes(parsed.status)
        ? parsed.status
        : 'warn';
      const score = Math.max(0, Math.min(100, Number(parsed.score) || 50));
      const summary = String(parsed.summary || `${brand} inspected ${p.label}`);
      return { brand, status, score, summary, raw };
    } catch {
      // AI didn't return valid JSON; keep the raw text as summary
      return {
        brand,
        status: 'warn',
        score: 50,
        summary: text.slice(0, 200) || `${brand} returned unparsable output`,
        raw,
      };
    }
  }
}
