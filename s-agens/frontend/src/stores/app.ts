import { create } from 'zustand';
import type { Report } from './reports';

export type Page = 'dashboard' | 'reports' | 'subjects';

export interface Subject {
  _id: string;
  kind: string;
  label: string;
  ctx: Record<string, unknown>;
  active: boolean;
  createdAt: string;
}

export interface AIStatus {
  available: string[];
}

interface AppState {
  page: Page;
  setPage: (p: Page) => void;

  subjects: Subject[];
  loadingSubjects: boolean;
  subjectsError: string | null;
  fetchSubjects: (apiUrl: string) => Promise<void>;
  createSubject: (apiUrl: string, data: { kind: string; label: string }) => Promise<void>;
  deleteSubject: (apiUrl: string, id: string) => Promise<void>;
  toggleSubject: (apiUrl: string, id: string, active: boolean) => Promise<void>;

  historicalReports: Report[];
  loadingReports: boolean;
  reportsError: string | null;
  fetchReports: (apiUrl: string) => Promise<void>;

  aiStatus: AIStatus | null;
  loadingAI: boolean;
  aiError: string | null;
  fetchAIStatus: (apiUrl: string) => Promise<void>;

  healthOk: boolean | null;
  fetchHealth: (apiUrl: string) => Promise<void>;
}

export const useApp = create<AppState>((set, get) => ({
  page: 'dashboard',
  setPage: (p) => set({ page: p }),

  subjects: [],
  loadingSubjects: false,
  subjectsError: null,
  fetchSubjects: async (apiUrl) => {
    set({ loadingSubjects: true, subjectsError: null });
    try {
      const res = await fetch(`${apiUrl}/api/subjects`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      set({ subjects: data.items ?? [], loadingSubjects: false });
    } catch (e) {
      set({ subjectsError: (e as Error).message, loadingSubjects: false });
    }
  },
  createSubject: async (apiUrl, data) => {
    const res = await fetch(`${apiUrl}/api/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, active: true }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await get().fetchSubjects(apiUrl);
  },
  deleteSubject: async (apiUrl, id) => {
    const res = await fetch(`${apiUrl}/api/subjects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await get().fetchSubjects(apiUrl);
  },
  toggleSubject: async (apiUrl, id, active) => {
    const res = await fetch(`${apiUrl}/api/subjects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await get().fetchSubjects(apiUrl);
  },

  historicalReports: [],
  loadingReports: false,
  reportsError: null,
  fetchReports: async (apiUrl) => {
    set({ loadingReports: true, reportsError: null });
    try {
      const res = await fetch(`${apiUrl}/api/reports?limit=100`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      set({ historicalReports: data.items ?? [], loadingReports: false });
    } catch (e) {
      set({ reportsError: (e as Error).message, loadingReports: false });
    }
  },

  aiStatus: null,
  loadingAI: false,
  aiError: null,
  fetchAIStatus: async (apiUrl) => {
    set({ loadingAI: true, aiError: null });
    try {
      const res = await fetch(`${apiUrl}/api/ai/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      set({ aiStatus: data, loadingAI: false });
    } catch (e) {
      set({ aiError: (e as Error).message, loadingAI: false });
    }
  },

  healthOk: null,
  fetchHealth: async (apiUrl) => {
    try {
      const res = await fetch(`${apiUrl}/health`);
      set({ healthOk: res.ok });
    } catch {
      set({ healthOk: false });
    }
  },
}));
