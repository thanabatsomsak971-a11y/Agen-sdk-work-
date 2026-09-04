import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useReports, type Report } from './stores/reports';
import { useApp } from './stores/app';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { SubjectsPage } from './pages/SubjectsPage';


const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

export default function App(): JSX.Element {
  const { push, setConnected, connected } = useReports();
  const { page, setPage } = useApp();

  useEffect(() => {
    const socket: Socket = io(API_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('report', (r: Report) => push(r));
    return () => {
      socket.close();
    };
  }, [push, setConnected]);

  return (
    <div className="flex h-full bg-carbon-950 text-chrome-400">
      <Sidebar page={page} setPage={setPage} connected={connected} />

      <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
        <div className="mx-auto max-w-4xl">
          {page === 'dashboard' && <DashboardPage apiUrl={API_URL} />}
          {page === 'reports' && <ReportsPage apiUrl={API_URL} />}
          {page === 'subjects' && <SubjectsPage apiUrl={API_URL} />}

        </div>
      </main>
    </div>
  );
}
