import { create } from 'zustand';

export interface Report {
  id: string;
  subjectId: string;
  subjectKind: string;
  status: 'ok' | 'warn' | 'alert';
  score: number;
  summary: string;
  aiProvider?: string;
  createdAt: number; // unix seconds
}

interface State {
  reports: Report[];
  connected: boolean;
  push: (r: Report) => void;
  setConnected: (c: boolean) => void;
  clear: () => void;
}

export const useReports = create<State>((set) => ({
  reports: [],
  connected: false,
  push: (r) =>
    set((s) => {
      if (s.reports.some((x) => x.id === r.id)) return s; // dedupe
      return { reports: [r, ...s.reports].slice(0, 200) };
    }),
  setConnected: (c) => set({ connected: c }),
  clear: () => set({ reports: [] }),
}));
