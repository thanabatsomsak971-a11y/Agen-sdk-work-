/**
 * WorkspaceConfig — reads REAL environment variables and reports their status.
 * Never exposes values, only presence (configured / missing).
 * No placeholders, no fake defaults — reports the truth.
 */

export interface ConfigKeyStatus {
  name: string;
  configured: boolean;
}

export interface ConfigGroup {
  label: string;
  keys: ConfigKeyStatus[];
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
}

function check(key: string): ConfigKeyStatus {
  return { name: key, configured: Boolean(process.env[key] && process.env[key]!.trim() !== '') };
}

function flag(key: string): FeatureFlag {
  const val = process.env[key];
  return { name: key, enabled: val === 'true' || val === '1' };
}

export function getWorkspaceConfig() {
  const groups: ConfigGroup[] = [
    {
      label: 'Security & Auth',
      keys: [
        check('JWT_SECRET'),
        check('REFRESH_TOKEN_SECRET'),
      ],
    },
    {
      label: 'Database',
      keys: [
        check('MONGO_DATABASE'),
        check('MONGO_ROOT_USERNAME'),
        check('MONGO_ROOT_PASSWORD'),
        check('REDIS_PASSWORD'),
        check('ELASTICSEARCH_URL'),
      ],
    },
    {
      label: 'AI Providers',
      keys: [
        check('ANTHROPIC_API_KEY'),
        check('ANTHROPIC_WORKSPACE_ID'),
        check('OPENAI_API_KEY'),
        check('OPENAI_MODEL'),
        check('HUGGINGFACE_API_KEY'),
        check('ML_SERVICE_API_KEY'),
        check('ML_SERVICE_URL'),
      ],
    },
    {
      label: 'Cloud Storage',
      keys: [
        check('AWS_ACCESS_KEY_ID'),
        check('AWS_SECRET_ACCESS_KEY'),
        check('AWS_REGION'),
        check('AWS_S3_BUCKET'),
        check('CLOUDINARY_CLOUD_NAME'),
        check('CLOUDINARY_API_KEY'),
        check('CLOUDINARY_API_SECRET'),
      ],
    },
    {
      label: 'Payments',
      keys: [
        check('STRIPE_SECRET_KEY'),
        check('STRIPE_PUBLISHABLE_KEY'),
        check('STRIPE_WEBHOOK_SECRET'),
      ],
    },
    {
      label: 'Email & Notifications',
      keys: [
        check('SENDGRID_API_KEY'),
        check('EMAIL_HOST'),
        check('EMAIL_USER'),
        check('EMAIL_PASS'),
        check('EMAIL_FROM'),
      ],
    },
    {
      label: 'Social Integrations',
      keys: [
        check('LINKEDIN_CLIENT_ID'),
        check('LINKEDIN_CLIENT_SECRET'),
        check('FACEBOOK_APP_ID'),
        check('FACEBOOK_APP_SECRET'),
        check('TWITTER_API_KEY'),
        check('TWITTER_API_SECRET'),
        check('TWITTER_BEARER_TOKEN'),
      ],
    },
    {
      label: 'Monitoring',
      keys: [
        check('SENTRY_DSN'),
        check('GA_TRACKING_ID'),
      ],
    },
    {
      label: 'Notion',
      keys: [
        check('NOTION_API_KEY'),
      ],
    },
  ];

  const features: FeatureFlag[] = [
    flag('ENABLE_REAL_TIME'),
    flag('ENABLE_ANALYTICS'),
    flag('ENABLE_AI_RECOMMENDATIONS'),
    flag('ENABLE_MIND_MAPS'),
    flag('ENABLE_VIDEO_UPLOAD'),
    flag('ENABLE_LIVE_STREAMING'),
    flag('ENABLE_RESPONSE_CACHE'),
    flag('ENABLE_QUERY_CACHE'),
    flag('ENABLE_ERROR_TRACKING'),
    flag('ENABLE_PERFORMANCE_MONITORING'),
    flag('ENABLE_USER_ANALYTICS'),
    flag('ENABLE_PLAYWRIGHT_TESTS'),
    flag('ENABLE_MOCK_DATA'),
    flag('SEED_DATABASE'),
  ];

  const totalKeys = groups.reduce((sum, g) => sum + g.keys.length, 0);
  const configuredKeys = groups.reduce(
    (sum, g) => sum + g.keys.filter((k) => k.configured).length,
    0,
  );

  return {
    nodeEnv: process.env.NODE_ENV ?? 'unknown',
    logLevel: process.env.LOG_LEVEL ?? 'info',
    debug: process.env.DEBUG === 'true',
    groups,
    features,
    summary: {
      total: totalKeys,
      configured: configuredKeys,
      missing: totalKeys - configuredKeys,
    },
  };
}

export type WorkspaceConfigResponse = ReturnType<typeof getWorkspaceConfig>;
