import { useEffect, useState, useCallback } from 'react';
import clsx from 'clsx';
import { useMemory, type MemoryLog } from '../stores/memory';

const CATEGORIES = ['', 'observation', 'decision', 'context', 'note', 'incident'];

const categoryTone: Record<string, string> = {
  observation: 'text-ice-300 border-ice-500/40 bg-ice-500/5',
  decision: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/5',
  context: 'text-chrome-400 border-chrome-600/40 bg-chrome-500/5',
  note: 'text-amber-300 border-amber-500/40 bg-amber-500/5',
  incident: 'text-red-300 border-red-500/40 bg-red-500/5',
};

export function MemoryDashboard(): JSX.Element {
  const { logs, loading, error, search, category, setSearch, setCategory, fetch, add, remove } =
    useMemory();
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('note');
  const [newTags, setNewTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetch(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newContent.trim()) return;
      setSubmitting(true);
      const tags = newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const ok = await add({ category: newCategory, content: newContent.trim(), tags });
      setSubmitting(false);
      if (ok) {
        setNewContent('');
        setNewTags('');
      }
    },
    [newContent, newCategory, newTags, add],
  );

  return (
    <div className="space-y-4">
      {/* Add entry */}
      <form
        onSubmit={handleSubmit}
        className="rounded border border-carbon-800 bg-carbon-900 p-4"
      >
        <div className="mb-2 flex flex-wrap gap-2">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="rounded border border-carbon-700 bg-carbon-800 px-2 py-1 text-sm text-chrome-400"
          >
            {CATEGORIES.filter(Boolean).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="tags (comma separated)"
            className="flex-1 rounded border border-carbon-700 bg-carbon-800 px-2 py-1 text-sm text-chrome-400 placeholder:text-chrome-600"
          />
        </div>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write a memory log entry..."
          rows={2}
          className="w-full resize-none rounded border border-carbon-700 bg-carbon-800 px-3 py-2 text-sm text-chrome-400 placeholder:text-chrome-600 focus:border-ice-500 focus:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !newContent.trim()}
            className="rounded bg-ice-500 px-4 py-1 text-sm font-medium text-carbon-950 disabled:opacity-40"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>

      {/* Search + filter */}
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search memory logs…"
          className="flex-1 rounded border border-carbon-700 bg-carbon-800 px-3 py-2 text-sm text-chrome-400 placeholder:text-chrome-600 focus:border-ice-500 focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-carbon-700 bg-carbon-800 px-3 py-2 text-sm text-chrome-400"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === '' ? 'all categories' : c}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      {error && (
        <div className="rounded border border-red-500/40 bg-red-500/5 px-3 py-2 text-sm text-red-300">
          Error: {error}
        </div>
      )}
      {loading && (
        <div className="px-3 text-sm text-chrome-600">Loading…</div>
      )}

      {/* List */}
      {!loading && !error && (
        <div className="space-y-1">
          {logs.length === 0 ? (
            <div className="rounded border border-dashed border-carbon-700 p-10 text-center text-chrome-600">
              No memory logs found. {search || category ? 'Try clearing your filters.' : 'Add one above.'}
            </div>
          ) : (
            logs.map((log) => <MemoryRow key={log.id} log={log} onDelete={remove} />)
          )}
        </div>
      )}
    </div>
  );
}

function MemoryRow({
  log,
  onDelete,
}: {
  log: MemoryLog;
  onDelete: (id: string) => void;
}): JSX.Element {
  const time = new Date(log.createdAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const tone = categoryTone[log.category] ?? 'text-chrome-400 border-carbon-700 bg-carbon-800';
  return (
    <div
      className={clsx(
        'rounded border-l-2 px-4 py-3',
        tone,
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="uppercase tracking-wider">{log.category}</span>
          <span className="text-chrome-600">·</span>
          <span className="font-mono text-chrome-600">{time}</span>
          {log.source !== 'manual' && (
            <span className="rounded bg-carbon-800 px-1.5 text-chrome-600">{log.source}</span>
          )}
        </div>
        <button
          onClick={() => onDelete(log.id)}
          className="text-chrome-600 transition-colors hover:text-red-300"
          title="Delete"
        >
          ✕
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm text-chrome-400">{log.content}</p>
      {log.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {log.tags.map((t) => (
            <span
              key={t}
              className="rounded bg-carbon-800 px-1.5 py-0.5 text-xs text-ice-300"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
