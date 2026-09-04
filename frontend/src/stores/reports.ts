import { create } from 'zustand';

export interface Report {
  id: string;
  subjectId: string;
  subjectLabel: string;
  subjectKind: string;
  status: 'ok' | 'warn' | 'alert';
  score: number;
  summary: string;
  aiProvider?: string;
  createdAt: string;
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
    set((s) => ({ reports: [r, ...s.reports].slice(0, 200) })),
  setConnected: (c) => set({ connected: c }),
  clear: () => set({ reports: [] }),
}));
