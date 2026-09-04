import { useEffect, useState } from 'react';
import { useApp } from '../stores/app';
import clsx from 'clsx';

export function SubjectsPage({ apiUrl }: { apiUrl: string }): JSX.Element {
  const {
    subjects,
    loadingSubjects,
    subjectsError,
    fetchSubjects,
    createSubject,
    deleteSubject,
    toggleSubject,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [kind, setKind] = useState('');
  const [label, setLabel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects(apiUrl);
  }, [apiUrl, fetchSubjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await createSubject(apiUrl, { kind, label });
      setKind('');
      setLabel('');
      setShowForm(false);
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-chrome-300">Subjects</h1>
          <p className="text-sm text-chrome-600">เป้าหมายที่ระบบตรวจสอบ (CRUD จริง)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-ice-500/10 px-3 py-1.5 text-xs font-medium text-ice-400 hover:bg-ice-500/20"
        >
          {showForm ? '✕ Cancel' : '+ Add Subject'}
        </button>
      </div>

      {subjectsError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          ⚠ {subjectsError}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-carbon-800 bg-carbon-900 p-4"
        >
          {formError && (
            <div className="text-sm text-red-400">⚠ {formError}</div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-chrome-600">
              Kind
            </label>
            <input
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              placeholder="ai, service, phone, ..."
              required
              className="w-full rounded-lg border border-carbon-700 bg-carbon-950 px-3 py-2 text-sm text-chrome-300 outline-none focus:border-ice-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-chrome-600">
              Label
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ชื่อเป้าหมาย"
              required
              className="w-full rounded-lg border border-carbon-700 bg-carbon-950 px-3 py-2 text-sm text-chrome-300 outline-none focus:border-ice-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-ice-500/20 px-4 py-2 text-sm font-medium text-ice-300 hover:bg-ice-500/30"
          >
            Create
          </button>
        </form>
      )}

      {loadingSubjects ? (
        <div className="py-10 text-center text-sm text-chrome-600">Loading...</div>
      ) : subjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-carbon-700 p-10 text-center text-sm text-chrome-600">
          ยังไม่มี subject — กด "+ Add Subject" เพื่อสร้าง
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between rounded-xl border border-carbon-800 bg-carbon-900 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-chrome-300">
                    {s.label}
                  </span>
                  <span className="shrink-0 rounded bg-carbon-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-chrome-500">
                    {s.kind}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-chrome-600">
                  {new Date(s.createdAt).toLocaleString('th-TH')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSubject(apiUrl, s._id, !s.active)}
                  className={clsx(
                    'rounded-lg px-2.5 py-1 text-xs font-medium',
                    s.active
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-carbon-700 text-chrome-600 hover:bg-carbon-600',
                  )}
                >
                  {s.active ? 'Active' : 'Paused'}
                </button>
                <button
                  onClick={() => deleteSubject(apiUrl, s._id)}
                  className="rounded-lg px-2.5 py-1 text-xs text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
