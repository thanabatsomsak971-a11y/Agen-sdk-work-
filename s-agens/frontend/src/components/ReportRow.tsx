import clsx from 'clsx';
import type { Report } from '../stores/reports';

const statusConfig: Record<
  Report['status'],
  { border: string; text: string; bg: string; label: string }
> = {
  ok: {
    border: 'border-l-emerald-500',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/5',
    label: 'OK',
  },
  warn: {
    border: 'border-l-amber-500',
    text: 'text-amber-300',
    bg: 'bg-amber-500/5',
    label: 'WARN',
  },
  alert: {
    border: 'border-l-red-500',
    text: 'text-red-400',
    bg: 'bg-red-500/5',
    label: 'ALERT',
  },
};

export function ReportRow({ r }: { r: Report }): JSX.Element {
  const cfg = statusConfig[r.status];
  const time = new Date(r.createdAt).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-lg border border-carbon-800 border-l-2 px-3 py-2.5',
        cfg.border,
        cfg.bg,
      )}
    >
      <div className="font-mono text-xs text-chrome-600">{time}</div>
      <div
        className={clsx(
          'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
          cfg.text,
        )}
      >
        {cfg.label}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-chrome-300">{r.subjectLabel}</span>
        <span className="ml-2 text-sm text-chrome-600">— {r.summary}</span>
      </div>
      {r.aiProvider && r.aiProvider !== 'stub' && (
        <span className="hidden shrink-0 rounded bg-carbon-700 px-1.5 py-0.5 text-[10px] text-chrome-500 sm:inline">
          {r.aiProvider}
        </span>
      )}
      <div className={clsx('shrink-0 font-mono text-sm font-bold', cfg.text)}>
        {r.score}
      </div>
    </div>
  );
}
