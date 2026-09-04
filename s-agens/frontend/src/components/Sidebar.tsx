import clsx from 'clsx';
import { SURFACES, type Surface, type SurfaceMeta } from '../stores/app';

const navItems = SURFACES.filter((s) => s.group === 'nav');
const toolItems = SURFACES.filter((s) => s.group === 'tools');

export function Sidebar({
  surface,
  setSurface,
  connected,
  toolsOpen,
  setToolsOpen,
}: {
  surface: Surface;
  setSurface: (s: Surface) => void;
  connected: boolean;
  toolsOpen: boolean;
  setToolsOpen: (open: boolean) => void;
}): JSX.Element {
  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-carbon-800 bg-carbon-900">
        {/* Identity — Lightning mark + S-AI */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ice-500/10 text-ice-400 glow-ice-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M13 2L4.09 12.97a.5.5 0 00.38.82H10l-1 8 8.91-10.97a.5.5 0 00-.38-.82H12l1-7z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold tracking-wide text-chrome-300">S-AI</div>
            <div className="text-[10px] uppercase tracking-widest text-chrome-600">
              Workspace Shell
            </div>
          </div>
        </div>

        {/* Primary navigation */}
        <nav className="mt-2 px-3">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={surface === item.id}
              onClick={() => setSurface(item.id)}
            />
          ))}
        </nav>

        {/* Tools section */}
        <div className="mt-4 px-3">
          <div className="px-3 pb-1 text-[10px] font-medium uppercase tracking-widest text-chrome-700">
            Tools
          </div>
          {toolItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={surface === item.id}
              onClick={() => setSurface(item.id)}
            />
          ))}
        </div>

        {/* Connection status — real WebSocket state */}
        <div className="mt-auto border-t border-carbon-800 px-5 py-4">
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

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-carbon-800 bg-carbon-900/95 px-2 py-2 backdrop-blur md:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSurface(item.id)}
            className={clsx(
              'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] transition-colors',
              surface === item.id ? 'text-ice-400' : 'text-chrome-600',
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Mobile tools FAB ── */}
      <button
        onClick={() => setToolsOpen(!toolsOpen)}
        className="fixed right-4 bottom-20 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-ice-500/20 text-ice-400 shadow-lg backdrop-blur md:hidden"
        aria-label="Tools"
      >
        🧩
      </button>

      {/* ── Mobile tools sheet ── */}
      {toolsOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setToolsOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-carbon-800 bg-carbon-900 p-4 pb-24"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-widest text-chrome-600">
                Tools
              </span>
              <button
                onClick={() => setToolsOpen(false)}
                className="text-chrome-600 hover:text-chrome-400"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {toolItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSurface(item.id)}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors',
                    surface === item.id
                      ? 'border-ice-500/30 bg-ice-500/10'
                      : 'border-carbon-800 bg-carbon-850',
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[10px] font-medium text-chrome-400">{item.label}</span>
                  {!item.implemented && (
                    <span className="text-[8px] uppercase tracking-wider text-chrome-700">
                      N/A
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: SurfaceMeta;
  active: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
        active
          ? 'bg-ice-500/10 text-ice-300 glow-ice-sm'
          : 'text-chrome-500 hover:bg-carbon-800 hover:text-chrome-300',
      )}
    >
      <span className="text-base">{item.icon}</span>
      <span className="flex-1 text-left font-medium">{item.label}</span>
      {!item.implemented && (
        <span className="rounded bg-carbon-700 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-chrome-600">
          N/A
        </span>
      )}
    </button>
  );
}
