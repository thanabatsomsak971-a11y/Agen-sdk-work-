import { useEffect } from 'react';
import { useApp } from '../stores/app';
import { ReportRow } from '../components/ReportRow';
import type { Report } from '../stores/reports';

export function ReportsPage({ apiUrl }: { apiUrl: string }): JSX.Element {
  const { historicalReports, loadingReports, reportsError, fetchReports } = useApp();

  useEffect(() => {
    fetchReports(apiUrl);
  }, [apiUrl, fetchReports]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-chrome-300">Report History</h1>
          <p className="text-sm text-chrome-600">บันทึก report ทั้งหมดจาก MongoDB</p>
        </div>
        <button
          onClick={() => fetchReports(apiUrl)}
          className="rounded-lg border border-carbon-700 px-3 py-1.5 text-xs text-chrome-400 hover:bg-carbon-800"
        >
          ↻ Refresh
        </button>
      </div>

      {reportsError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          ⚠ {reportsError}
        </div>
      )}

      {loadingReports ? (
        <div className="py-10 text-center text-sm text-chrome-600">Loading...</div>
      ) : historicalReports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-carbon-700 p-10 text-center text-sm text-chrome-600">
          ยังไม่มี report ในฐานข้อมูล
        </div>
      ) : (
        <div className="space-y-1.5">
          {historicalReports.map((r: Report) => (
            <ReportRow key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}
