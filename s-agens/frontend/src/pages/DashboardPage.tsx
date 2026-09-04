import { useEffect } from 'react';
import { useReports } from '../stores/reports';
import { useApp } from '../stores/app';
import { StatCard } from '../components/StatCard';
import { ReportRow } from '../components/ReportRow';

export function DashboardPage({ apiUrl }: { apiUrl: string }): JSX.Element {
  const { reports, connected } = useReports();
  const { subjects, fetchSubjects, healthOk, fetchHealth } = useApp();

  useEffect(() => {
    fetchSubjects(apiUrl);
    fetchHealth(apiUrl);
  }, [apiUrl, fetchSubjects, fetchHealth]);

  const counts = reports.reduce(
    (acc, r) => {
      acc[r.status] += 1;
      return acc;
    },
    { ok: 0, warn: 0, alert: 0 } as Record<string, number>,
  );

  const activeSubjects = subjects.filter((s) => s.active).length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-carbon-800 bg-gradient-to-br from-carbon-900 to-carbon-950 p-6">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-ice-500/5 blur-3xl" />
        <div className="relative">
          <h1 className="text-xl font-bold text-chrome-300">Live Inspection Dashboard</h1>
          <p className="mt-1 text-sm text-chrome-600">
            ระบบตรวจสอบแบบเรียลไทม์ — รับ report จาก backend ผ่าน WebSocket
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge
              label="WebSocket"
              ok={connected}
              okText="Connected"
              failText="Disconnected"
            />
            <StatusBadge
              label="Backend"
              ok={healthOk === true}
              okText="Healthy"
              failText={healthOk === false ? 'Unreachable' : 'Checking...'}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="OK" value={counts.ok} tone="ok" icon="✓" />
        <StatCard label="Warning" value={counts.warn} tone="warn" icon="⚠" />
        <StatCard label="Alert" value={counts.alert} tone="alert" icon="✕" />
        <StatCard label="Active Subjects" value={activeSubjects} tone="ice" icon="🎯" />
      </div>

      {/* Live feed */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-chrome-500">
            Live Reports
          </h2>
          <span className="text-xs text-chrome-600">{reports.length} in buffer</span>
        </div>
        {reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-carbon-700 p-10 text-center">
            <div className="text-3xl opacity-30">📡</div>
            <p className="mt-3 text-sm text-chrome-600">
              รอ report จาก backend... (ทุก 5 วิ ระบบจะสร้าง report จาก subject ที่ active)
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {reports.slice(0, 20).map((r) => (
              <div key={r.id} className="animate-slide-in">
                <ReportRow r={r} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  label,
  ok,
  okText,
  failText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  failText: string;
}): JSX.Element {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-carbon-800 bg-carbon-950/50 px-3 py-1.5">
      <span className="text-xs text-chrome-600">{label}</span>
      <span
        className={`flex items-center gap-1.5 text-xs font-medium ${
          ok ? 'text-emerald-400' : 'text-red-400'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            ok ? 'bg-emerald-400 animate-pulse-dot' : 'bg-red-400'
          }`}
        />
        {ok ? okText : failText}
      </span>
    </div>
  );
}
