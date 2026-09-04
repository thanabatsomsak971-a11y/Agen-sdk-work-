import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface ConfigKeyStatus {
  name: string;
  configured: boolean;
}

interface ConfigGroup {
  label: string;
  keys: ConfigKeyStatus[];
}

interface FeatureFlag {
  name: string;
  enabled: boolean;
}

interface WorkspaceConfig {
  nodeEnv: string;
  logLevel: string;
  debug: boolean;
  groups: ConfigGroup[];
  features: FeatureFlag[];
  summary: { total: number; configured: number; missing: number };
}

export function SettingsSurface({ apiUrl }: { apiUrl: string }): JSX.Element {
  const [config, setConfig] = useState<WorkspaceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/api/workspace/config`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setConfig(data))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  if (loading)
    return <div className="py-10 text-center text-sm text-chrome-600">Loading...</div>;
  if (error)
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
        ⚠ {error}
      </div>
    );
  if (!config) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-chrome-300">Settings</h1>
        <p className="text-sm text-chrome-600">
          สถานะ env จริงจาก backend — ไม่มีการ hardcode หรือ fake status
        </p>
      </div>

      {/* Runtime info */}
      <div className="grid grid-cols-3 gap-2">
        <InfoCard label="Node Env" value={config.nodeEnv} />
        <InfoCard label="Log Level" value={config.logLevel} />
        <InfoCard label="Debug" value={config.debug ? 'true' : 'false'} />
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-carbon-800 bg-carbon-900 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-chrome-400">Config Summary</span>
          <span className="text-xs text-chrome-600">
            {config.summary.configured}/{config.summary.total} configured
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-carbon-800">
          <div
            className="h-full rounded-full bg-ice-500 transition-all"
            style={{
              width: `${(config.summary.configured / config.summary.total) * 100}%`,
            }}
          />
        </div>
        {config.summary.missing > 0 && (
          <p className="mt-2 text-xs text-amber-400">
            ⚠ {config.summary.missing} env var(s) not configured
          </p>
        )}
      </div>

      {/* Config groups */}
      <div className="space-y-4">
        {config.groups.map((group) => (
          <div
            key={group.label}
            className="rounded-xl border border-carbon-800 bg-carbon-900 overflow-hidden"
          >
            <div className="border-b border-carbon-800 px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-chrome-500">
                {group.label}
              </span>
            </div>
            <div className="divide-y divide-carbon-850">
              {group.keys.map((key) => (
                <div
                  key={key.name}
                  className="flex items-center justify-between px-4 py-2"
                >
                  <span className="font-mono text-xs text-chrome-500">{key.name}</span>
                  <span
                    className={clsx(
                      'flex items-center gap-1.5 text-xs font-medium',
                      key.configured ? 'text-emerald-400' : 'text-red-400',
                    )}
                  >
                    <span
                      className={clsx(
                        'h-1.5 w-1.5 rounded-full',
                        key.configured ? 'bg-emerald-400' : 'bg-red-400',
                      )}
                    />
                    {key.configured ? 'Configured' : 'Missing'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Feature flags */}
      <div className="rounded-xl border border-carbon-800 bg-carbon-900 overflow-hidden">
        <div className="border-b border-carbon-800 px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-chrome-500">
            Feature Flags
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-carbon-850">
          {config.features.map((flag) => (
            <div
              key={flag.name}
              className="flex items-center justify-between bg-carbon-900 px-4 py-2"
            >
              <span className="font-mono text-xs text-chrome-500">{flag.name}</span>
              <span
                className={clsx(
                  'rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                  flag.enabled
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-carbon-700 text-chrome-600',
                )}
              >
                {flag.enabled ? 'On' : 'Off'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-carbon-800 bg-carbon-900 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-chrome-600">{label}</div>
      <div className="mt-1 text-sm font-medium text-chrome-300">{value}</div>
    </div>
  );
}
