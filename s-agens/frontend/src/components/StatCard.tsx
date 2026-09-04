import clsx from 'clsx';

export function StatCard({
  label,
  value,
  tone = 'default',
  icon,
}: {
  label: string;
  value: number | string;
  tone?: 'default' | 'ok' | 'warn' | 'alert' | 'ice';
  icon?: string;
}): JSX.Element {
  const toneClass = {
    default: 'text-chrome-300',
    ok: 'text-emerald-400',
    warn: 'text-amber-300',
    alert: 'text-red-400',
    ice: 'text-ice-400',
  }[tone];

  return (
    <div className="rounded-xl border border-carbon-800 bg-carbon-900 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-chrome-600">
          {label}
        </span>
        {icon && <span className="text-sm opacity-60">{icon}</span>}
      </div>
      <div className={clsx('mt-1.5 font-mono text-2xl font-bold', toneClass)}>
        {value}
      </div>
    </div>
  );
}
