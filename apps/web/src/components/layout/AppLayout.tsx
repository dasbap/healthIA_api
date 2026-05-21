import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Topbar onMenuClick={() => setSidebarOpen((open) => !open)} />
        <main className="content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      {sidebarOpen ? <button className="sidebar-scrim" aria-label="Fermer le menu" onClick={() => setSidebarOpen(false)} /> : null}
    </div>
  );
}
