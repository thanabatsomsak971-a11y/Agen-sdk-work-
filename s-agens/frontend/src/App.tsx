import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useReports, type Report } from './stores/reports';
import { useApp, SURFACES } from './stores/app';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsSurface } from './surfaces/ProjectsSurface';
import { AIStatusPage } from './pages/AIStatusPage';
import { NotImplementedSurface } from './surfaces/NotImplementedSurface';
import { ChatSurface } from './surfaces/ChatSurface';

const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

export default function App(): JSX.Element {
  const { push, setConnected, connected } = useReports();
  const { surface, setSurface, toolsOpen, setToolsOpen } = useApp();

  useEffect(() => {
    const socket: Socket = io(API_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('report', (r: Report) => push(r));
    return () => {
      socket.close();
    };
  }, [push, setConnected]);

  const currentSurface = SURFACES.find((s) => s.id === surface);

  return (
    <div className="flex h-full bg-carbon-950 text-chrome-400">
      <Sidebar
        surface={surface}
        setSurface={setSurface}
        connected={connected}
        toolsOpen={toolsOpen}
        setToolsOpen={setToolsOpen}
      />

      <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
        <div className="mx-auto max-w-4xl">
          {/* Mobile surface header */}
          <div className="mb-4 flex items-center gap-2 md:hidden">
            <span className="text-lg">{currentSurface?.icon}</span>
            <h1 className="text-base font-bold text-chrome-300">
              {currentSurface?.label}
            </h1>
          </div>

          {/* Real surfaces with backing implementation */}
          {surface === 'home' && <DashboardPage apiUrl={API_URL} />}
          {surface === 'projects' && <ProjectsSurface apiUrl={API_URL} />}
          {surface === 'agents' && <AIStatusPage apiUrl={API_URL} />}
          {surface === 'chat' && <ChatSurface apiUrl={API_URL} />}

          {/* Surfaces without implementation — honest NOT IMPLEMENTED */}
          {currentSurface && !currentSurface.implemented && (
            <NotImplementedSurface surface={currentSurface} />
          )}
        </div>
      </main>
    </div>
  );
}
