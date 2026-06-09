import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { env } from '../../config/env';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Aller au contenu principal
      </a>
      <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Topbar onMenuClick={() => setSidebarOpen((open) => !open)} />
        {env.useMocks ? (
          <div className="mock-banner" role="status" aria-live="polite">
            Mode démo : les recommandations affichées proviennent des mocks frontend tant que l’API IA n’est pas connectée.
          </div>
        ) : null}
        <main id="main-content" className="content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      {sidebarOpen ? <button className="sidebar-scrim" aria-label="Fermer le menu" onClick={() => setSidebarOpen(false)} /> : null}
    </div>
  );
}
