import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { apiFallbackEventName } from '../../api/httpClient';
import { env } from '../../config/env';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fallbackActive, setFallbackActive] = useState(env.useMocks);

  useEffect(() => {
    function handleApiFallback() {
      setFallbackActive(true);
    }

    window.addEventListener(apiFallbackEventName, handleApiFallback);
    return () => window.removeEventListener(apiFallbackEventName, handleApiFallback);
  }, []);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Aller au contenu principal
      </a>
      <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Topbar onMenuClick={() => setSidebarOpen((open) => !open)} />
        {fallbackActive ? (
          <div className="mock-banner" role="status" aria-live="polite">
            {env.useMocks
              ? 'Mode démo : les recommandations affichées proviennent des mocks frontend tant que l’API IA n’est pas connectée.'
              : 'API IA indisponible : affichage temporaire des mocks frontend.'}
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
