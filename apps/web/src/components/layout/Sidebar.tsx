import { Activity, Dumbbell, History, LayoutDashboard, Salad, ScanSearch, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { routes } from '../../config/routes';

const links = [
  { to: routes.dashboard, label: 'Dashboard IA', icon: LayoutDashboard },
  { to: routes.mealAnalysis, label: 'Analyse repas', icon: ScanSearch },
  { to: routes.nutritionRecommend, label: 'Nutrition IA', icon: Salad },
  { to: routes.sportRecommend, label: 'Sport IA', icon: Dumbbell },
  { to: routes.recommendations, label: 'Historique', icon: History },
  { to: routes.profile, label: 'Profil', icon: UserRound }
];

type SidebarProps = {
  isOpen: boolean;
  onNavigate: () => void;
};

export function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} aria-label="Navigation principale">
      <div className="sidebar-brand">
        <Activity aria-hidden="true" />
        <div>
          <strong>HealthAI</strong>
          <span>Coach IA</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink key={link.to} to={link.to} onClick={onNavigate} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} aria-hidden="true" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
