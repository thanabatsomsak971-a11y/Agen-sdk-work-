import clsx from 'clsx';
import type { Page } from '../stores/app';

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⚡' },
  { id: 'reports', label: 'Reports', icon: '📋' },
  { id: 'subjects', label: 'Subjects', icon: '🎯' },
  { id: 'ai-status', label: 'AI Status', icon: '🤖' },
];

export function Sidebar({
  page,
  setPage,
  connected,
}: {
  page: Page;
  setPage: (p: Page) => void;
  connected: boolean;
}): JSX.Element {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-carbon-800 bg-carbon-900">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ice-500/10 text-ice-400 glow-ice-sm">
            ⚡
          </div>
          <div>
            <div className="text-sm font-bold tracking-wide text-chrome-300">S-AGENS</div>
            <div className="text-[10px] uppercase tracking-widest text-chrome-600">
              Inspection System
            </div>
          </div>
        </div>

        <nav className="mt-2 flex-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                page === item.id
                  ? 'bg-ice-500/10 text-ice-300 glow-ice-sm'
                  : 'text-chrome-500 hover:bg-carbon-800 hover:text-chrome-300',
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-carbon-800 px-5 py-4">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={clsx(
                'h-2 w-2 rounded-full',
                connected ? 'bg-emerald-400 animate-pulse-dot' : 'bg-red-400',
              )}
            />
            <span className={connected ? 'text-emerald-400' : 'text-red-400'}>
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-carbon-800 bg-carbon-900/95 px-2 py-2 backdrop-blur md:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={clsx(
              'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] transition-colors',
              page === item.id ? 'text-ice-400' : 'text-chrome-600',
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
