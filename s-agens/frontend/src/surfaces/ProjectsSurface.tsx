import { useState } from 'react';
import clsx from 'clsx';
import { SubjectsPage } from '../pages/SubjectsPage';
import { ReportsPage } from '../pages/ReportsPage';

type Tab = 'subjects' | 'reports';

export function ProjectsSurface({ apiUrl }: { apiUrl: string }): JSX.Element {
  const [tab, setTab] = useState<Tab>('subjects');

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border border-carbon-800 bg-carbon-900 p-1">
        <TabButton active={tab === 'subjects'} onClick={() => setTab('subjects')}>
          Subjects
        </TabButton>
        <TabButton active={tab === 'reports'} onClick={() => setTab('reports')}>
          Reports
        </TabButton>
      </div>

      {/* Real pages with backing implementation */}
      {tab === 'subjects' && <SubjectsPage apiUrl={apiUrl} />}
      {tab === 'reports' && <ReportsPage apiUrl={apiUrl} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-ice-500/10 text-ice-300'
          : 'text-chrome-600 hover:text-chrome-400',
      )}
    >
      {children}
    </button>
  );
}
