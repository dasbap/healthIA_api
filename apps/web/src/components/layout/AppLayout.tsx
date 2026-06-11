import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { apiFallbackEventName } from '../../api/httpClient';
import { env } from '../../config/env';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiMode, setApiMode] = useState<'active' | 'forced-mock' | 'api-error'>(
    env.useMocks ? 'forced-mock' : 'active'
  );

  useEffect(() => {
    function handleApiFallback(event: Event) {
      const reason = (event as CustomEvent<{ reason?: 'forced-mock' | 'api-error' }>).detail?.reason;
      setApiMode(reason === 'forced-mock' ? 'forced-mock' : 'api-error');
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
        <Topbar
          onMenuClick={() => setSidebarOpen((open) => !open)}
          apiStatusLabel={
            apiMode === 'forced-mock'
              ? 'Mode démo frontend'
              : apiMode === 'api-error'
                ? 'API IA indisponible'
                : 'API IA active'
          }
        />
        {apiMode !== 'active' ? (
          <div className="mock-banner" role="status" aria-live="polite">
            {apiMode === 'forced-mock'
              ? 'Mode démo frontend : les réponses affichées proviennent des mocks locaux.'
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
