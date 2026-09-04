import { useEffect } from 'react';
import { useApp } from '../stores/app';

export function AIStatusPage({ apiUrl }: { apiUrl: string }): JSX.Element {
  const { aiStatus, loadingAI, aiError, fetchAIStatus } = useApp();

  useEffect(() => {
    fetchAIStatus(apiUrl);
  }, [apiUrl, fetchAIStatus]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-chrome-300">AI Ensemble Status</h1>
        <p className="text-sm text-chrome-600">
          สถานะ AI providers จริงจาก backend (ไม่ใช่ hardcode)
        </p>
      </div>

      {aiError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          ⚠ {aiError}
        </div>
      )}

      {loadingAI ? (
        <div className="py-10 text-center text-sm text-chrome-600">Loading...</div>
      ) : aiStatus ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-carbon-800 bg-carbon-900 p-5">
            <div className="text-xs font-medium uppercase tracking-wider text-chrome-600">
              Available Providers
            </div>
            {aiStatus.available.length === 0 ? (
              <div className="mt-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-sm text-amber-300">
                  ไม่มี AI provider ที่พร้อมใช้ — ระบบทำงานในโหมด stub
                </span>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {aiStatus.available.map((brand) => (
                  <div
                    key={brand}
                    className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
                    <span className="text-sm font-medium text-emerald-400">{brand}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {aiStatus.hint && (
            <div className="rounded-lg border border-carbon-800 bg-carbon-900/50 px-4 py-3 text-xs text-chrome-600">
              {aiStatus.hint}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
