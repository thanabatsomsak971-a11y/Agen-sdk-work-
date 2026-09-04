import type { SurfaceMeta } from '../stores/app';

/**
 * Honest "NOT IMPLEMENTED" surface.
 * No fake status, no mock UI — just the truth.
 * Per BUILD-FIRST rule: surface exists only when runtime is real.
 */
export function NotImplementedSurface({
  surface,
}: {
  surface?: SurfaceMeta;
}): JSX.Element {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-chrome-300">
          {surface?.icon} {surface?.label}
        </h1>
        <p className="text-sm text-chrome-600">S-AI Workspace Surface</p>
      </div>

      <div className="rounded-xl border border-carbon-800 bg-carbon-900 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-carbon-800 text-3xl opacity-40">
          {surface?.icon}
        </div>

        <div className="inline-block rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2">
          <span className="text-sm font-medium uppercase tracking-wider text-amber-400">
            NOT IMPLEMENTED
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-chrome-600">
          Surface นี้ยังไม่มี implementation จริง
          <br />
          จะใช้งานได้เมื่อมี backend + runtime จริงเท่านั้น
        </p>
      </div>
    </div>
  );
}
