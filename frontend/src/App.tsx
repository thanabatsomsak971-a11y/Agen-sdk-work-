import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useReports, type Report } from './stores/reports';
import { ReportRow } from './components/ReportRow';

const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export default function App(): JSX.Element {
  const { reports, connected, push, setConnected, clear } = useReports();

  useEffect(() => {
    const socket: Socket = io(API_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('report', (r: Report) => push(r));
    return () => {
      socket.close();
    };
  }, [push, setConnected]);

  const counts = reports.reduce(
    (acc, r) => {
      acc[r.status] += 1;
      return acc;
    },
    { ok: 0, warn: 0, alert: 0 } as Record<Report['status'], number>,
  );

  return (
    <div className="min-h-full bg-carbon-950 font-sans text-chrome-400">
      <header className="border-b border-carbon-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ice-500/10 text-ice-400">
              ⚡
            </div>
            <div>
              <div className="text-lg font-semibold text-chrome-400">S-AGENS</div>
              <div className="text-xs text-chrome-600">Live Inspection & Reporting</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span
              className={
                connected
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }
            >
              ● {connected ? 'connected' : 'offline'}
            </span>
            <button
              onClick={clear}
              className="rounded border border-carbon-700 px-3 py-1 hover:bg-carbon-800"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-xs">
          <Stat label="OK" value={counts.ok} tone="text-emerald-400" />
          <Stat label="WARN" value={counts.warn} tone="text-amber-300" />
          <Stat label="ALERT" value={counts.alert} tone="text-red-300" />
          <Stat label="TOTAL" value={reports.length} tone="text-chrome-400" />
        </div>
      </header>

      <main className="p-6">
        {reports.length === 0 ? (
          <div className="rounded border border-dashed border-carbon-700 p-10 text-center text-chrome-600">
            รอ report จาก backend... (ทุก 5 วิ ระบบจะสร้าง report จาก subject ที่ active)
          </div>
        ) : (
          <div className="space-y-1">
            {reports.map((r) => (
              <ReportRow key={r.id} r={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}): JSX.Element {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-chrome-600">{label}</span>
      <span className={`font-mono ${tone}`}>{value}</span>
    </div>
  );
}
