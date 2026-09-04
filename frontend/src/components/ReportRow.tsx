import clsx from 'clsx';
import type { Report } from '../stores/reports';

const statusColor: Record<Report['status'], string> = {
  ok: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/5',
  warn: 'text-amber-300 border-amber-500/40 bg-amber-500/5',
  alert: 'text-red-300 border-red-500/40 bg-red-500/5',
};

export function ReportRow({ r }: { r: Report }): JSX.Element {
  const time = new Date(r.createdAt * 1000).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return (
    <div
      className={clsx(
        'grid grid-cols-[80px_100px_1fr_60px] items-center gap-3 border-l-2 px-3 py-2 text-sm',
        statusColor[r.status],
      )}
    >
      <div className="font-mono text-xs opacity-70">{time}</div>
      <div className="text-xs uppercase tracking-wider opacity-80">{r.subjectKind}</div>
      <div className="truncate">
        <span className="font-medium">{r.summary}</span>
        {r.aiProvider && (
          <span className="ml-2 rounded bg-ice-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-ice-400">
            {r.aiProvider}
          </span>
        )}
      </div>
      <div className="text-right font-mono">{r.score}</div>
    </div>
  );
}
