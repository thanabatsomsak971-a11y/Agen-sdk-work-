import { create } from 'zustand';

export interface MemoryLog {
  id: string;
  category: string;
  content: string;
  tags: string[];
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface State {
  logs: MemoryLog[];
  loading: boolean;
  error: string | null;
  search: string;
  category: string;
  setSearch: (q: string) => void;
  setCategory: (c: string) => void;
  fetch: () => Promise<void>;
  add: (data: {
    category: string;
    content: string;
    tags?: string[];
    source?: string;
  }) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
}

const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

export const useMemory = create<State>((set, get) => ({
  logs: [],
  loading: false,
  error: null,
  search: '',
  category: '',
  setSearch: (q) => set({ search: q }),
  setCategory: (c) => set({ category: c }),
  fetch: async () => {
    const { search, category } = get();
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (category) params.set('category', category);
      const res = await fetch(`${API_URL}/api/memory?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = (await res.json()) as { items: Record<string, unknown>[] };
      const items: MemoryLog[] = raw.items.map((r) => ({
        id: String(r._id ?? r.id),
        category: String(r.category),
        content: String(r.content),
        tags: (r.tags as string[]) ?? [],
        source: String(r.source ?? 'manual'),
        createdAt: String(r.createdAt),
        updatedAt: String(r.updatedAt),
      }));
      set({ logs: items, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false, logs: [] });
    }
  },
  add: async (data) => {
    try {
      const res = await fetch(`${API_URL}/api/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await get().fetch();
      return true;
    } catch (e) {
      set({ error: (e as Error).message });
      return false;
    }
  },
  remove: async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/memory/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
