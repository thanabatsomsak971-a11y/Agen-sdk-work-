/// <reference types="@cloudflare/workers-types" />

export interface Env {
  // Bindings
  DB: D1Database;
  STREAM: DurableObjectNamespace;

  // Vars
  CORS_ORIGIN: string;
  INSPECTION_INTERVAL_MS: string;

  // Secrets (set via `wrangler secret put NAME`)
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
}
